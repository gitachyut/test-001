var moment = require('moment-timezone');
const dataMapper = ( data ) => {
    return [
        [
            data.postDate,
            "View Comments",
            "",
            data.media.label,
            `${data.title}\n${data.post}`,
            "",
            data.views,
            data.comments,
            data.likes,
            data.shares,
            data.author,
            data.post_type.label,
            data.url
        ]
    ]
};

module.exports = {
    dataMapper
}