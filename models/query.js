'use strict';
module.exports = (sequelize, DataTypes) => {
    const Query = sequelize.define('Query',
        {
            id: {
                allowNull: false,
                autoIncrement: false,
                primaryKey: true,
                type: DataTypes.UUID
            },
            businessId: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            boolquery: {
                type: DataTypes.TEXT('long') + ' CHARSET utf8 COLLATE utf8_unicode_ci',
                allowNull: true
            },
            query: {
                type: DataTypes.TEXT('long') + ' CHARSET utf8 COLLATE utf8_unicode_ci',
                allowNull: true
            },
            category: {
                type: DataTypes.STRING,
                allowNull: false
            },
            subcategory: {
                type: DataTypes.STRING,
                allowNull: true
            },
            deleteQuery: {
                type: DataTypes.TEXT('long') + ' CHARSET utf8 COLLATE utf8_unicode_ci',
                allowNull: true
            },
            meta: {
                type: DataTypes.TEXT('long') + ' CHARSET utf8 COLLATE utf8_unicode_ci',
                allowNull: true
            },
            logs: {
                type: DataTypes.TEXT('long') + ' CHARSET utf8 COLLATE utf8_unicode_ci',
                allowNull: true
            }
        },
        {
            timestamps: true
        });

        Query.associate = function (models) {
            Query.belongsTo(models.Business,{
                foreignKey: 'businessId',
            })

        };
    return Query;
};