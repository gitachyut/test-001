'use strict';
module.exports = (sequelize, DataTypes) => {

    const Links = sequelize.define('Links',
        {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER
            },
            link: {
                type: DataTypes.STRING,
                allowNull: false
            },
            media: {
                type: DataTypes.STRING,
                allowNull: false
            },
            businessId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            projectId: {
                type: DataTypes.UUID,
                allowNull: false
            },
            date: {
                type: DataTypes.DATE,
                allowNull: false
            },
            isComplete: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            isError: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            priority: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            meta:{
                type: DataTypes.TEXT,
                allowNull: true 
            }
        },
        {
            timestamps: true
        }
    );

    Links.associate = function (models) {
        Links.hasMany(models.Business, {
            foreignKey: 'businessId',
        }),
        Links.hasMany(models.Query, {
            foreignKey: 'projectId',
        })
    };

    return Links;
};