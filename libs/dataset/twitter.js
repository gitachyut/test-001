var moment = require('moment-timezone');

let dataset = (data) => {

    return {
        "id": data.id,
        "conversation_id": data.id,
        "created_at": "30-11-2020 12:34:06 IST",
        "date": "30-11-2020",
        "time": "12:34:06",
        "timezone": "+0530",
        "user_id": "365886581",
        "username": data.author,
        "name": data.author,
        "place": "",
        "tweet": data.post,
        "language": "",
        "mentions": [],
        "urls": "",
        "photos": "",
        "replies_count": "1",
        "retweets_count": "0",
        "likes_count": "1",
        "hashtags": [],
        "cashtags": "",
        "link": data.url,
        "retweet": "",
        "quote_url": "",
        "video": "1",
        "thumbnail": data.url,
        "near": "",
        "geo": "",
        "source": "",
        "user_rt_id": "",
        "user_rt": "",
        "retweet_id": "",
        "reply_to": "",
        "retweet_date": "",
        "translate": "",
        "trans_src": "",
        "trans_dest": "",
        "media": "twitter",
        "post": data.post,
        "post_date": moment(data.postDate, "YYYY-MM-DDTHH:mm:ss.SSSZZ"),
        "summary": data.post,
        "text": data.post,
        "title": data.title || "",
        "likes": data.likes,
        "comment_count": data.comments,
        "shares": 0,
        "reactions_count": 0,
        "reactions": {},
        "author": data.author,
        "view_count": data.views,
        "external_url": data.url,
        "url": data.url,
        "post_type": data.post_type.value
    }

};

module.exports = {
    twitter: dataset
};



