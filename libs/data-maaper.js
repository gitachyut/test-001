var moment = require('moment-timezone');
const dataMapper = ( data ) => {
    return [
        [
            moment(data.postDate).format('DD/MM/YYYY hh:mm:ss'),
            data.author,
            "",
            data.media.label,
            `${data.title}\n${data.post}`,
            "",
            parseInt( data.views ) || 0,
            parseInt( data.comments ) || 0,
            parseInt( data.likes ) || 0,
            parseInt( data.shares ) || 0,
            data.author,
            data.post_type.label,
            data.url
        ]
    ]
};

module.exports = {
    dataMapper
}