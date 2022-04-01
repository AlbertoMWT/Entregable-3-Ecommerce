//models
const { Carts } = require('../models/carts.model');
const { Products } = require('../models/products.model');
const { ProductsInCart } = require('../models/productsInCart.model');
const { Orders } = require('../models/orders.model');

//utils
const { catchAsync } = require('../util/catchAsync');
const { AppError } = require('../util/appError');

exports.getUserCart = catchAsync(async (req, res, next) => {
    const { currentUser } = req;

    const cart = await Carts.findOne({
        where: { status: 'active', userId: currentUser.id },
        include: [
            {
                model: Products,
                through: { where: { status: 'active' } }
            }
        ]
    });

    if (!cart) {
        return next(new AppError(404, 'This user does not have a cart yet'));
    }

    res.status(200).json({ status: 'success', data: { cart } });
});

exports.addProductToCart = catchAsync(async (req, res, next) => {
    const { currentUser } = req;
    const { productId, quantity } = req.body;

    //check if product to add, does not exceeds that requested amount
    const product = await Products.findOne({
        where: { status: 'active', id: productId }
    });

    if (quantity > product.quantity) {
        return next(
            new AppError(
                400,
                `This product only has ${product.quantity} items.`
            )
        );
    }

    //check if user's cart is active, if not, create one
    const cart = await Carts.findOne({
        where: { status: 'active', userId: currentUser.id }
    });

    if (!cart) {
        //create a new cart
        const newCart = await Carts.create({ userId: currentUser.id });

        await ProductsInCart.create({
            productId,
            cartId: newCart.id,
            quantity
        });
    } else {
        //cart already exists
        //check if product is already in the cart
        const productExists = await ProductsInCart.findOne({
            where: { cartId: cart.id, productId }
        });

        if (productExists && productExists.status === 'active') {
            return next(
                new AppError(400, 'This product is already in the cart')
            );
        }

        //if product is in the cart but was removed before, add it again
        if (productExists && productExists.status === 'removed') {
            await productExists.update({ status: 'active', quantity });
        }

        //add new product to cart
        if (!productExists) {
            await ProductsInCart.create({
                cartId: cart.id,
                productId,
                quantity
            });
        }
    }

    res.status(201).json({ status: 'success' });
});

exports.updateCartProduct = catchAsync(async (req, res, next) => {
    const { currentUser } = req;
    const { productId, quantity } = req.body;

    // Check if quantity exceeds available amount
    const product = await Products.findOne({
        where: { status: 'active', id: productId }
    });

    if (quantity > product.quantity) {
        return next(
            new AppError(400, `This product only has ${product.quantity} items`)
        );
    }

    // Find user's cart
    const cart = await Carts.findOne({
        where: { status: 'active', userId: currentUser.id }
    });

    if (!cart) {
        return next(new AppError(400, 'This user does not have a cart yet'));
    }

    // Find the product in cart requested
    const ProductsInCart = await ProductsInCart.findOne({
        where: { status: 'active', cartId: cart.id, productId }
    });

    if (!ProductsInCart) {
        return next(
            new AppError(404, `Can't update product, is not in the cart yet`)
        );
    }

    // If qty is 0, mark the product's status as removed
    if (quantity === 0) {
        await ProductsInCart.update({ quantity: 0, status: 'removed' });
    }

    // Update product to new qty
    if (quantity > 0) {
        await ProductsInCart.update({ quantity });
    }

    res.status(204).json({ status: 'success' });
});

exports.removeProductFromCart = catchAsync(async (req, res, next) => {
    const { currentUser } = req;
    const { productId } = req.params;

    const cart = await Carts.findOne({
        where: { status: 'active', userId: currentUser.id }
    });

    if (!cart) {
        return next(new AppError(404, 'This user does not have a cart yet'));
    }

    const ProductsInCart = await ProductsInCart.findOne({
        where: { status: 'active', cartId: cart.id, productId }
    });

    if (!ProductsInCart) {
        return next(
            new AppError(404, 'This product does not exist in this cart')
        );
    }

    await ProductsInCart.update({ status: 'removed', quantity: 0 });

    res.status(204).json({ status: 'success' });
});

exports.purchaseCart = catchAsync(async (req, res, next) => {
    const { currentUser } = req;

    // Find user's cart
    const cart = await Carts.findOne({
        where: { status: 'active', userId: currentUser.id },
        include: [
            {
                model: Products,
                through: { where: { status: 'active' } }
            }
        ]
    });

    if (!cart) {
        return next(new AppError(404, 'This user does not have a cart yet'));
    }

    let totalPrice = 0;

    // Update all products as purchased
    const cartPromises = cart.products.map(async (product) => {
        await product.ProductsInCart.update({ status: 'purchased' });

        // Get total price of the order
        const productPrice = product.price * product.ProductsInCart.quantity;

        totalPrice += productPrice;

        // Discount the quantity from the product
        const newQty = product.quantity - product.ProductsInCart.quantity;

        return await product.update({ quantity: newQty });
    });

    await Promise.all(cartPromises);

    // Mark cart as purchased
    await cart.update({ status: 'purchased' });

    const newOrder = await Orders.create({
        userId: currentUser.id,
        cartId: cart.id,
        issuedAt: Date.now().toLocaleString(),
        totalPrice
    });

    res.status(201).json({
        status: 'success',
        data: { newOrder }
    });
});
