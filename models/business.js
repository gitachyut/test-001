'use strict';
module.exports = (sequelize, DataTypes) => {

    const Business = sequelize.define('Business',
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            address: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            logoUrl: {
                type: DataTypes.STRING,
                allowNull: true
            },
            config: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            isDeleted: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            }
        },
        {
            timestamps: false
        }
    );

    Business.associate = function (models) {
        Business.hasMany(models.Query, {
            foreignKey: 'businessId',
        })
    };

    return Business;
};