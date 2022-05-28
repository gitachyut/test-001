'use strict';
module.exports = (sequelize, DataTypes) => {
    const User_Group = sequelize.define('User_Group',
        {
            user_id: DataTypes.INTEGER,
            group_id: DataTypes.UUID
        },
        {
            timestamps: false,
            indexes: [
                {
                    fields: ['user_id', 'group_id']
                }
            ]
        });
    User_Group.associate = function (models) {
    };
    return User_Group;
};