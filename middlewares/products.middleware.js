const { catchAsync } = require('../util/catchAsync');

const { Products } = require('../models/products.model');
const { AppError } = require('../util/appError');

exports.productExists = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const product = await Products.findOne({
        where: {
            status: 'active',
            id
        }
    });

    if (!product) {
        return next(new AppError(404, 'No product found'));
    }

    req.product = product;
});

exports.productOwner = catchAsync(async (req, res, next) => {
    //get current session user's Id
    const { currentUser, product } = req;

    //compare products userId
    if (product.userId !== currentUser.id) {
        return next(new AppError(403, 'You are not the owner of this product'));
    }

    next();
});
