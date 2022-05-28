const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const JWT_SECRET = 'secret';
const JWT_EXPIRES_IN = '2d';
const PASSWORD_SALT_NO = 10;

module.exports = {
    checkPasswordMatch: function (password, hash) {
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, hash, function (err, res) {
                if (!res || err)
                    return reject();
                return resolve();
            })
        })
    },

    checkTokenMatch: function (token, hash) {
        return new Promise((resolve, reject) => {
            bcrypt.compare(token, hash, function (err, res) {
                if (!res || err)
                    return reject();
                return resolve();
            })
        })
    },

    generatePasswordHash: function (password) {
        return new Promise((resolve, reject) => {
            bcrypt.hash(password, PASSWORD_SALT_NO, function (err, hash) {
                if (!hash || err)
                    return reject();
                return resolve(hash)
            });
        })
    },

    generateToken: function (options) {
        return jwt.sign(options, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    },

    verifyToken: function (token) {
        return jwt.verify(token, JWT_SECRET);
    }
}