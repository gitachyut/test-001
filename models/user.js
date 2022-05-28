'use strict';
module.exports = (sequelize, DataTypes) => {

    const User = sequelize.define('User',
        {
            name: {
                type: DataTypes.STRING,
                allowNull: true
            },
            username: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            address: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            password: {
                type: DataTypes.STRING,
                allowNull: true
            },
            role_id: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            meta: {
                type: DataTypes.TEXT,
                allowNull: true
            },

            tokenHash: {
                type: DataTypes.STRING,
                allowNull: true
            },
            avaterUrl: {
                type: DataTypes.STRING,
                allowNull: true
            },
            isVerified: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
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

    User.associate = function (models) {

        User.hasMany(models.TreditionalMediaTracker, {
            foreignKey: 'user_id',
        })
        User.hasMany(models.Job, {
            foreignKey: 'userId',
        })
        User.belongsTo(models.Role,
            {
                as: 'role',
                foreignKey: 'role_id',
            });
    };

    return User;
};