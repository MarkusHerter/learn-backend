'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class UserToBox extends Model {
        static associate(models) {
            this.belongsTo(models.User, {
                foreignKey: 'UserId',
                as: 'user'
            });
            this.belongsTo(models.Box, {
                foreignKey: 'BoxId',
                as: 'box'
            });
        }
    }

    UserToBox.init({
        UserId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        BoxId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Boxes',
                key: 'id'
            }
        },
        rights: {
            type: DataTypes.ENUM,
            values: ['r', 'rw', 'rwd'],
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'UserToBox',
    });

    return UserToBox;
};

