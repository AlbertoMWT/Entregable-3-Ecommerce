const { body, validationResult } = require('express-validator');
const { AppError } = require('../util/appError');
const { catchAsync } = require('../util/catchAsync');

//Products validation
exports.createProductValidations = [
    body('title')
        .isString()
        .withMessage('Title must be a string')
        .notEmpty()
        .withMessage('Must provide a valid title'),
    body('description')
        .isString()
        .withMessage('Description must be a string')
        .notEmpty()
        .withMessage('Must provide a valid title'),
    body('quantity')
        .isNumeric()
        .withMessage('Must be a number')
        .custom((value) => value > 0)
        .withMessage('Must be greater than 0'),
    body('price')
        .isNumeric()
        .withMessage('Must be a number')
        .custom((value) => value > 0)
        .withMessage('Must be greater than 0')
];

exports.addProductToCartValidation = [
    body('productId')
        .isNumeric()
        .withMessage('Product id must be a number')
        .custom((value) => value > 0)
        .withMessage('Must provide a valid id'),
    body('quantity')
        .isNumeric()
        .withMessage('Quantity id must be a number')
        .custom((value) => value > 0)
        .withMessage('Must provide a quantity greater than 0')
];

exports.validateResult = catchAsync(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorMsg = errors
            .array()
            .map(({ msg }) => msg)
            .join('. ');
        return next(new AppError(400, errorMsg));
    }

    next();
});
