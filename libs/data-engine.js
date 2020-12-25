const { pushToElastic, update, checkExist } = require('./elastic-functions');
const defaultSentimentScore = require('./default-sentiment.json');
const { calculateSentiment } = require('./sentiment');
const { truncateString } = require("./common");
const mentionHashtag = require('./mention-hashtag');
var moment = require('moment-timezone');
const DEFAULT_THUMBNAIL = "https://s3-ap-southeast-1.amazonaws.com/assets.ns-maap.com/thumbnails/facebook.png"
const
    FACEBOOK_INDEX = "facebook",
    INSTAGRAM_INDEX = "instagram",
    REDDIT_INDEX = "reddit",
    YOUTUBE_INDEX = "youtube",
    TWITTER_INDEX = "twitter";


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

        data = { ...data, ...rest  };

        try {
            let esResponse = await pushToElastic(index, id, data);
        } catch (error) {
            console.log('Error', error)
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
        shares = 0,
        view_count = 0,
        reactions_count = 0,
        reactions = {},
        mentions = [], 
        hashtags = [],
        author= null,
        post_date = moment(),
        url = null,
        external_url = null,
        thumbnail = null,
        post_type = null;

    switch (media) {

        case 'facebook': {
            post = data['text'];
            title = data['title'];
            id = data.post_id;
            index = FACEBOOK_INDEX;
            likes =  data['Like'];
            comment_count =  data['Comment_Count'] ; 
            shares= data['Shares'] ;
            author = data['source'];
            reactions = {
                loves: 0,
                wows: 0,
                haha: 0,
                sad: 0,
                angry: 0,
                special: 0,
            };
            url = data.Url;
            external_url = data.Url;
            original_url = data.Url;
            thumbnail = DEFAULT_THUMBNAIL;
            post_date =  data.utime;
            post_type = data.Post_Type;
            break;
        }

        case 'instagram': {
            post = data.post;
            title = data.title;
            id = data.id;
            index = INSTAGRAM_INDEX;
            likes = data.edge_media_preview_like.count;
            comment_count = data.edge_media_to_comment.count;
            author = data.owner.username;
	        post_type = data.post_type;
            post_date =  data.post_date
            url =  data.url;
            thumbnail = null;
            view_count = data.view_count;
            break;
        }


                
        case 'youtube': {
            post = data['description'];
            title = data['title'];
            id = data.videoId;
            index = YOUTUBE_INDEX;
            likes = data['likes'];
            comment_count = data['comments'] || 0;
            author = data['author'];
            post_date = moment(data['publishedAt']);
            url = data['url'];
            thumbnail = null;
            view_count = data['viewcount'];
            post_type = 'video';
            break;
        }

        case 'reddit': {
            post = data['selftext'];
            title = data['title'] || "";
            author = data['author'];
            likes = data['likes'];
            comment_count = data['num_comments'];
            id = data.id;
            index = REDDIT_INDEX;
	        post_type = data.post_type;
            post_date = data.post_date;
            url = data.external_url
            external_url = data['external_url'] ;
            view_count = data['view_count'];
            thumbnail = null;
            break;
        }

        case 'twitter': {
            post = data['tweet'];
            id = data.id;
            index = TWITTER_INDEX;
            likes = data.likes;
            comment_count = data.comment_count;
            view_count = data.view_count;
            author = data.author
            url = data['link'] ;
            post_type = data.post_type;
            post_date = data.post_date;
            external_url = data.url;
            thumbnail = data.url;
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
        post_type
    }
}


