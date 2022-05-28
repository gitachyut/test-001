'use strict';
module.exports = (sequelize, DataTypes) => {
    const Group = sequelize.define('Group',
        {
            id: {
                allowNull: false,
                autoIncrement: false,
                primaryKey: true,
                type: DataTypes.UUID
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            meta: {
                type: DataTypes.TEXT,
                allowNull: true
            }
        },
        {
            timestamps: false
        }
    );

    Group.associate = function (models) {
        Group.belongsToMany(models.Business , {
            through: {
                model: models.Business_Group
            },
            foreignKey: 'group_id',
            otherKey: 'business_id'
        });

        Group.belongsToMany(models.Query , {
            as: 'projects',
            through: {
                model: models.Query_Group
            },
            foreignKey: 'group_id',
            otherKey: 'query_id'
        });


        Group.belongsToMany(models.User , {
            as: 'groups',
            through: {
                model: models.User_Group
            },
            foreignKey: 'group_id',
            otherKey: 'user_id'
        });

    };

    return Group;
};