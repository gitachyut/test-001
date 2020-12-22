const extract = require('mention-hashtag')
module.exports = (post) => {
    return  extract(post, 'all')
}