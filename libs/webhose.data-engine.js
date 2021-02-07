const { pushToElastic, update, checkExist } = require('./elastic-functions')
const defaultSentimentScore = require('./default-sentiment.json');
const { calculateSentiment } = require('./sentiment');
const { truncateString } = require("./common");
const mentionHashtag = require('./mention-hashtag')
var moment = require('moment-timezone');
const DEFAULT_THUMBNAIL = "https://s3-ap-southeast-1.amazonaws.com/assets.ns-maap.com/thumbnails/facebook.png"
const WEB_INDEX = "web";

const
    SUMMARY_LENGTH = 300,
    TITLE_LENGTH = 30;

const
    ELASTIC_HOST = "search.ns-maap.com:9200"




const postValidate = (post) => {
    if(post !== null && post !== ""  && post !== " " &&  post !== undefined) {
        return true
    }else{
        return false
    }
}
const engine = async (event) => {

    let { media, data } = event;
    let { post, title, id, index, post_date, hashtags, mentions, ...rest } = generateMetaSocialMedia(media, data);

    if(postValidate(post) && id){

        mentions = mentionHashtag(post).mentions;
        hashtags = mentionHashtag(post).hashtags;
        //let keywords  = [];

        let sentiment = {}

        try {
            let exist =  await checkExist( index, id, data);
            if(!exist){
		        sentiment = await calculateSentiment(post);
            }

        } catch (error) {
            console.log('Err', error)
        }

        data.id = id;
        data.media = media;
        data.post = post;
        data.post_date = post_date;
        data.summary = post;
        data.text = post;
        data.title = title;
        data.keywords = [];
        data.sentiment = sentiment;
        data.customSentiment = sentiment;
        data.originalSentiment = sentiment;
        data.mentions = mentions;
        data.hashtags = hashtags;
        data.createdAt = moment().format("YYYY-MM-DDTHH:mm:ss.SSSZZ");

        data = { ...data, ...rest  };

        try {
		    await pushToElastic(index, id, data)
        } catch (error) {
            console.log('Err', error)
        }
    }
    return id;
}

module.exports = {
    addSocialMediaArticle: async (event) => {
        const id = await engine(event);
        return id;
    },
    updateArticle: async (index, id , data) => {
        await update(index, id, data);
        return;
    }
}



function generateMetaSocialMedia(media, data) {
    let post = '',
        id = '',
        index = '',
        likes = 0,
        title = null,
        comment_count = 0,
        shares = null,
        view_count = null,
        reactions_count = null,
        reactions = null
        mentions = [],
        hashtags = [],
        author= null,
        parent_id = null;
        tag = null,
        post_date = moment(),
        url = null,
        external_url = null,
        thumbnail = null,
        media_type = null,
	    post_type = null;

        
    switch (media) {

        case 'web': {
            post = data.text ? data.text : data.title ;
            id = data.uuid;
            index = WEB_INDEX;
            author = data.thread.site_full || data.thread.site;
            post_date = data.published ? moment(data.published) : moment();
            title = data.title || "";
            url = data.thread.url || "";
            external_url = data.thread.url || "";
            post_type = data.thread['site_type'] || "";
            likes =  parseInt( data.likes ) || 0 ;
            comment_count = parseInt (data.comments ) || 0;
            shares =  parseInt (data.shares) || 0 ;
            view_count = parseInt (data.views) || 0;
            thumbnail =  data.thread.main_image || null;
            break;
        }

    }


    return {
        id: id,
        post: post,
        title : title,
        index: index,
        post_date: post_date.format("YYYY-MM-DDTHH:mm:ss.SSSZZ"),
        likes,
        comment_count,
        shares,
        reactions_count,
        reactions,
        mentions,
        hashtags,
        author,
        view_count,
        external_url,
        url,
        thumbnail,
        parent_id,
        tag,
	    post_type,
        media_type
    }
}