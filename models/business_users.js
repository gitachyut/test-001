'use strict';
module.exports = (sequelize, DataTypes) => {
    
    const Business_User = sequelize.define('Business_User',
        {
            business_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            user_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            }
        },
        {
            timestamps: false,
            indexes: [
                {
                    fields: ['business_id', 'user_id']
                }
            ]
        });

    Business_User.associate = function (models) {
    };

    return Business_User;
};