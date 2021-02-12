var moment = require('moment-timezone');
const dataMapper = ( data ) => {
    let media = '';
    let url = new URL(data.url);
    let host = url.hostname;
    if(
        host === 'forums.hardwarezone.com.sg' || 
        host === 'www.forums.hardwarezone.com.sg' ||
        host === 'sgtalk.org' ||
        host === 'www.sgtalk.org'
    ){
        media = 'Forum';
    }else{
        media = data.media.label;
    }

    return [
        [
            data.id,
            moment(data.postDate).format("DD/MM/YYYY"),
            data.author,
            "",
            media,
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

