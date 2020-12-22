const { pushToElastic, update, checkExist } = require('./elastic-functions')
const defaultSentimentScore = require('./default-sentiment.json');
const { calculateSentiment } = require('./sentiment');
const { truncateString } = require("./common");
const mentionHashtag = require('./mention-hashtag')
var moment = require('moment-timezone');

const DEFAULT_THUMBNAIL = "https://s3-ap-southeast-1.amazonaws.com/assets.ns-maap.com/thumbnails/facebook.png"
const
    FACEBOOK_INDEX = "facebook" ,
    INSTAGRAM_INDEX = "instagram" ,
    REDDIT_INDEX = "reddit",
    YOUTUBE_INDEX = "youtube" ,
    YOUTUBE_COMMENTS_INDEX = "youtube_comments",
    TRADITIONAL_INDEX = 'traditional';
    WEB_INDEX = "web";

const
    SUMMARY_LENGTH = 300,
    TITLE_LENGTH = 30;

const WAIT = 15;

const postValidate = (post) => {
    if(post !== null && post !== ""  && post !== " " &&  post !== undefined) {
        return true
    }else{
        return false
    }
}


const engine = async (event) => {

    let { media, data } = event;
    let { post, title, id, index, post_date, hashtags, mentions } = generateMetaSocialMedia(media, data);

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

//        console.log(sentiment)
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

        data = { ...data  };

        try {
            let exist =  await checkExist(index, id, data);

            console.log('#################### Exist #######################', exist);
		    let r =  await pushToElastic(index, id, data)
            /*if(!exist){
                let r =  await pushToElastic(index, id, data)
                console.log('inseet with id ', r,  data.post_type)
            }else{
                let r = await update(index, id, data)
                console.log('inseet with id', r, id, data.post_type)
            }*/
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
            id = data.post_id;
            index = FACEBOOK_INDEX;
            likes =  data['Like'];
            comment_count = data['Comment_Count'] ; 
            shares= data['Shares'] ;
            author = data['source'];
            reactions = {
                loves: parseInt( data['Love']),
                wows: parseInt( data['Wow']),
                haha: parseInt( data['Haha']),
                sad: parseInt( data['Sad']),
                angry:parseInt(  data['Angry']),
                special: 0,
            };
            url = data.url 
            external_url = data.url 
            original_url = data.url 
            thumbnail = DEFAULT_THUMBNAIL;
            post_date =  moment(data.utime);
            post_type = data.Post_Type
            break;
        }



        case 'instagram': {
            post = data.edge_media_to_caption.edges[0].node.text || '';
            title = data.title;
            id = data.id;
            index = INSTAGRAM_INDEX;
            likes = data.edge_media_preview_like ? data.edge_media_preview_like.count : data.edge_liked_by,
            comment_count = data.edge_media_to_comment.count,
            author = data.owner.username 
	        post_type = data.hasOwnProperty('is_video') ? ( data.is_video ? 'video' : 'post' ) : 'post';
            post_date = moment(data.taken_at_timestamp)
            url = "https://www.instagram.com/p/" + data.shortcode
            thumbnail = null;
            view_count = data.is_video ? data.video_view_count : null;
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
            tag = [data.tag];
            post_date = moment(data['publishedAt']);
            url = data['url'];
            thumbnail = data['thumbnail'];
            view_count = data['viewcount'];
            post_type = 'video';
            break;
        }

        case 'reddit': {
            post = data['selftext'] ? data['selftext'] : data['title'];
            title = data['title'] || "";
            author = data['author'];
            likes = data['likes'];
            comment_count = data['num_comments'];
            id = data.id;
            index = REDDIT_INDEX;
	        post_type = data.is_video ? 'video' : 'post';
            tag = data.tag;
            post_date = moment.unix(data['created']);
            url = "https://reddit.com" + data['permalink'];
            external_url = data['url'] ;
            thumbnail = data['thumbnail'];
            break;
        }

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
            likes =  data.hasOwnProperty('thread') ?  data.thread.social.facebook.likes : 0 ;
            comment_count = data.hasOwnProperty('thread') ?  data.thread.social.facebook.comments : 0;
            shares =  data.hasOwnProperty('thread') ?   data.thread.social.facebook.shares : 0 ;
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
        post_type
    }
}


