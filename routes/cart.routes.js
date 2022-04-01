const express = require('express');

//Controller
const {
    addProductToCart,
    getUserCart,
    updateCartProduct,
    removeProductFromCart,
    purchaseCart
} = require('../controllers/cart.controller');
//Middlewares
const { validateSession } = require('../middlewares/auth.middleware');
const {
    addProductToCartValidation,
    validateResult
} = require('../middlewares/validators.midleware');

const router = express.Router();

router.use(validateSession);

router.get('/', getUserCart);

router.post(
    '/add-product',
    addProductToCartValidation,
    validateResult,
    addProductToCart
);

router.patch('/update-product', updateCartProduct);

router.post('/purchase', purchaseCart);

router.delete('/:productId', removeProductFromCart);

module.exports = {
    cartsRouter: router
};
