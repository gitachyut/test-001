const Business = require('../models').Business;
const Group = require('../models').Group;
const Query = require('../models').Query;
const User = require('../models').User;
const Business_Group = require('../models').Business_Group;
const SocialMediaConfig = require('../models').SocialMediaConfig
const SocialMediaKeyword = require('../models').SocialMediaKeyword
const SocialMedia = require('../models').SocialMedia
const jobsRepo = require('../models').Job
const boom = require('boom');
const { JOB_TYPE, JOB_STATUS } = require('../libs/job-enums');
const uuidv1 = require('uuid'); 

module.exports = {
    create: async (req, res) => {
        let { name, description, address } = req.body
        if (!name)
            throw boom.badRequest("Required field name cannot be empty.")

        return Business
            .create({ name, address, description })
            .then(business => {
                return business;
            })
            .then(business => Business.findByPk(business.id, { attributes: { exclude: ['revision', 'isDeleted'] } }))
            .then(business => {
                try { business.config = JSON.parse(business.config) } catch (e) { }
                return res.status(201).json(business)
            })
    },

    list: async (req, res) => {
        return Business
            .findAll({ where: { isDeleted: false }, attributes: { exclude: ['revision', 'isDeleted'] } })
            .then(businesses => {
                businesses.forEach(business => {
                    try { business.config = JSON.parse(business.config) } catch (e) { }
                })
                return res.status(200).json(businesses)
            })
    }
};
