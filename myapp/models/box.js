'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Box extends Model {
        static associate(models) {
            this.hasMany(models.Card, {
                foreignKey: 'BoxId',
            });
            this.belongsTo(models.User, {
                foreignKey: 'creatorId',
                as: 'creator',
            });
            this.belongsToMany(models.User, { through: models.UserToBox });
        }
    }

    Box.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        creatorId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Users',
                key: 'id'
            }
        }
    }, {
        sequelize,
        modelName: 'Box',
    });

    return Box;
};

