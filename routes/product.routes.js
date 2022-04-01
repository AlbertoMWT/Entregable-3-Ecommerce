const express = require('express');

const {
    getAllProducts,
    createProduct,
    getProductById,
    updateProduct,
    disableProduct
} = require('../controllers/products.controller');
const { validateSession } = require('../middlewares/auth.middleware');
const {
    productExists,
    productOwner
} = require('../middlewares/products.middleware');
const {
    createProductValidations,
    validateResult
} = require('../middlewares/validators.midleware');

const router = express.Router();

router.use(validateSession);

router
    .route('/')
    .get(getAllProducts)
    .post(createProductValidations, validateResult, createProduct);

router
    .use('/:id', productExists)
    .route('/:id')
    .get(getProductById)
    .patch(productOwner, updateProduct)
    .delete(productOwner, disableProduct);

module.exports = {
    productsRouter: router
};
