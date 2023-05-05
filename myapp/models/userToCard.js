'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class UserToCard extends Model {
        static associate(models) {
            this.belongsTo(models.User, {
                foreignKey: 'UserId',
                as: 'user'
            });
            this.belongsTo(models.Card, {
                foreignKey: 'CardId',
                as: 'card'
            });
        }
    }

    UserToCard.init({
        UserId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        CardId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'Cards',
                key: 'id'
            }
        },
        pocket: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        LastTimePicked: {
            type: DataTypes.BIGINT
        }
    }, {
        sequelize,
        modelName: 'UserToCard',
        timestamps: false,
    });

    return UserToCard;
};
