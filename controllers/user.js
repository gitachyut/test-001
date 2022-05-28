const { generatePasswordHash } = require('../libs/auth')
const User = require('../models').User;
const Role = require('../models').Role;
const Business_User = require('../models').Business_User;
const boom = require('boom');
const { has } = require('lodash');

const ROLE_ID = {
    client: 3,
    staff: 2,
    admin: 1,
    uploader: 4,
    translator: 6,
    "account-handler": 5,
    "client_admin": 7,
    "client_read": 8,
    "client_write":9,
    "client_list":10
}

module.exports = {

    create: async (req, res) => {
        let {
            name, email, password, address, avaterUrl = null, roleId, businessId
        } = req.body

        console.log("roleId", roleId)

        if (!name)
            throw boom.badRequest("Name field cannot be empty");

        if (!email)
            throw boom.badRequest("Email field cannot be empty");

        if (!password)
            throw boom.badRequest("Password field cannot be empty");

        if (!roleId)
            throw boom.badRequest("Role field cannot be empty");

        var role = await Role.findByPk(roleId);
        if (!role)
            throw boom.badRequest("Role not found");

        return User
            .findOne({
                where: { email: email }
            })
            .then((user) => {
                if (user)
                    throw boom.conflict("User is already registered")
                return "Ok";
            })
            .then(() => {
                return generatePasswordHash(password)
            })
            .then(hash => {
                return User
                    .create({
                        name: name,
                        email: email,
                        username: email,
                        address: address,
                        avater_url: avaterUrl,
                        role_id: role.id,
                        password: hash,
                        tokenHash: hash
                    })
            })
            .then(user => {
                return Business_User.create({ 
                    business_id: businessId, 
                    user_id: user.id 
                })
                .then(() => { return user });
            })
            .then(user => {
                return res.status(201).json(user)
            });
    },

    list: async (req, res) => {
        return User
            .findAll({
                where: { isDeleted: false },
                // attributes: { exclude: ['role_id', 'password', 'revision', 'tokenHash', 'isDeleted'] }
            })
            .then(users => res.status(200).json(users))
            .catch(err => console.log(err))
    },

    destroy: async (req, res) => {
        let { force } = req.query;
        if (force)
            return User
                .findById(req.params.userId)
                .then(user => {
                    if (!user)
                        throw boom.notFound("User not found");
                    return user;
                }).then(user => {
                    return user.destroy({ userId: req.currentUser.id })
                }).then(() => {
                    res.status(204).send()
                });
        else
            return User
                .findById(req.params.userId)
                .then(user => {
                    if (!user)
                        throw boom.notFound("User not found");
                    return user;
                }).then(user => {
                    return user
                        .update({
                            isActive: false,
                            isDeleted: true,
                            tokenHash: null,
                        }, { userId: req.currentUser.id })
                }).then(() => {
                    res.status(204).send()
                });
    },

    changePassword: async (req, res) => {
        let { password } = req.body

        if (!password)
            throw boom.badRequest("password cannot be empty")

        return User
            .findById(req.params.userId)
            .then(user => {
                if (!user)
                    throw boom.unauthorized("User not found")
                return user;
            })
            .then(user => {
                return generatePasswordHash(password).then((hash) => { return { user, hash } })
            })
            .then(inp => {
                return inp.user.update({
                    password: inp.hash,
                    tokenHash: null
                }, { userId: req.currentUser.id })
            })
            .then(() => {
                return res.status(200).send();
            })
    }
};
