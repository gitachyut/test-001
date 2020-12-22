'use strict';
module.exports = (sequelize, DataTypes) => {
    
    const Job = sequelize.define('Job',
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
            status: {
                type: DataTypes.STRING,
                allowNull: false
            },
            result: {
                type: DataTypes.TEXT('long') + ' CHARSET utf8 COLLATE utf8_unicode_ci',
                allowNull: true
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            tag: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            createdOn: {
                type: DataTypes.DATE,
                allowNull: true
            },
            scheduledOn: {
                type: DataTypes.DATE,
                allowNull: true
            },
            completedOn: {
                type: DataTypes.DATE,
                allowNull: true
            }
        },
        {
            timestamps: false
        });

    Job.associate = function (models) {
        Job.hasMany(models.TreditionalMediaTracker, {
            foreignKey: 'job_id',
        })
        
        Job.belongsTo(models.User,{
            foreignKey: 'userId',
        });
    };

    return Job;
};