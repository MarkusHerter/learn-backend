'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Card extends Model {
        static associate(models) {
            this.belongsTo(models.Box, {
                foreignKey: 'BoxId',
                as: 'box'
            });
            this.belongsToMany(models.User, { through: models.UserToCard });
        }
    }

    Card.init({
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        front: {
            type: DataTypes.TEXT,
            unique: 'compositeIndex'
        },
        back: {
            type: DataTypes.TEXT
        },
        BoxId: {
            type: DataTypes.INTEGER,
            unique: 'compositeIndex'
        }
    }, {
        sequelize,
        modelName: 'Card',
        timestamps: false,
    });

    return Card;
};
