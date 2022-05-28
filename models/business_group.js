'use strict';
module.exports = (sequelize, DataTypes) => {
    const Business_Group = sequelize.define('Business_Group',
        {
            business_id: DataTypes.INTEGER,
            group_id: DataTypes.UUID
        },
        {
            timestamps: false,
            indexes: [
                {
                    fields: ['business_id', 'group_id']
                }
            ]
        });
    Business_Group.associate = function (models) {
    };
    return Business_Group;
};