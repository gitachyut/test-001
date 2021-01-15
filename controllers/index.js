const website = require('./website');
const instagram = require('./instagram');
const reddit = require('./reddit');
const twitter = require('./twitter');
const youtube = require('./youtube');
const facebook = require('./facebook');
const client = require('./client');
const news = require('./news');
const importData = require('./importData');
const commentsExports = require('./comment-exports');
module.exports = {
    website,
    reddit,
    instagram,
    twitter,
    youtube,
    facebook,
    client,
    commentsExports,
    news,
    importData
};
