const { Carts } = require('../models/carts.model');
const { Orders } = require('../models/orders.model');
const { Products } = require('../models/products.model');
const { ProductsInCart } = require('../models/productsInCart.model');
const { Users } = require('../models/users.model');

// Models

const initModels = () => {
    //1 User <--> M Product
    Users.hasMany(Products);
    Products.belongsTo(Users);

    // 1User <--> m Orders
    Users.hasMany(Orders);
    Orders.belongsTo(Users);

    //1User <--> 1cart
    Users.hasOne(Carts);
    Carts.belongsTo(Users);

    //M carts <--> M products
    Carts.belongsToMany(Products, { through: ProductsInCart });
    Products.belongsToMany(Carts, { through: ProductsInCart });

    Carts.hasOne(Orders);
    Orders.belongsTo(Carts);
};

module.exports = { initModels };
