'use strict';
module.exports = (sequelize, DataTypes) => {
    
    const Role = sequelize.define('Role',
        {
            title: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            }
        },
        {
            timestamps: false
        }
    );

    Role.associate = function (models) {

        Role.hasMany(models.User, {
            foreignKey: 'role_id'            
        })

    };

    return Role;
};