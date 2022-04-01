const {DataTypes} = require('sequelize')
const { sequelize } = require('../util/database')

const Orders = sequelize.define('order', {
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    },
    userId:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    cartId:{
        type:DataTypes.INTEGER,
        allowNull: false
    },
    issuedAt:{
        type: DataTypes.STRING(255),
        allowNull: false
    },
    totalPrice:{
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status:{
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 'active'
    }
});

module.exports = {
    Orders
}