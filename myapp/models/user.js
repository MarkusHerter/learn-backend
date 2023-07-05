'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            this.hasMany(models.UserToBox, {
                foreignKey: 'UserId',
                as: 'userToBoxes'
            });
            this.hasMany(models.Box, {
                foreignKey: 'creatorId',
                as: 'creator'
            });
            this.belongsToMany(models.Card, { through: models.UserToCard });
            this.belongsToMany(models.Box, { through: models.UserToBox });
        }
    }

    User.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        admin: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false

        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        confirm: {
            type: DataTypes.STRING
        }
    }, {
        sequelize,
        modelName: 'User',
    });

    return User;
};

