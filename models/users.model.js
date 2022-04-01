const {DataTypes} = require('sequelize')
const { sequelize } = require('../util/database')

const Users = sequelize.define('user', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    },
    username:{
        type: DataTypes.STRING(50),
        allowNull: false
    },
    email:{
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true,
    },
    password:{
        type: DataTypes.STRING(200),
        allowNull: false
    },
    status:{
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 'active'
    }
})

module.exports = {
    Users
}