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

        case 'traditional': {
            post =  data['description'];
            title = data['headline'];
            id = data.id.toString();
            index = TRADITIONAL_INDEX;
            author = data['mediaName'];
            post_date = moment(data['date']);
            thumbnail =  "https://newssearch.sg/uploaded/"+ data['file'].split(',')[0];
            media_type = data['mediumType'];
            post_type = data['mediumType'];
	    url =  "https://newssearch.sg/uploaded/"+ data['file'].split(',')[0];
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

        case 'reddit_comments': {
            post = data['body'];
            author = data['author'];
            id = data.id;
            parent_id = data.parent_id;
            index = REDDIT_COMMENTS_INDEX;
            post_date = moment.unix(data['created_utc'])
            break;
        }

        case 'facebook': {
            post = data['status_message'];
            title = data['link_name']
            id = data.status_id;
            index = FACEBOOK_INDEX;
            likes = data['num_likes'];
            comment_count = data['num_comments'];
            shares = data['num_shares'];
            reactions_count = data['num_reactions'];
            author = data['author'];
            reactions = {
                loves: data['num_loves'],
                wows: data['num_wows'],
                haha: data['num_hahas'],
                sad: data['num_sads'],
                angry: data['num_angrys'],
                special: data['num_special']
            };
            tag = [data["author"]]
            url = `https://facebook.com/${data.status_id.split('_')[0]}/posts/${data.status_id.split('_')[1]}`;
            external_url = data["status_link"] || null
            thumbnail = DEFAULT_THUMBNAIL;
            post_date =  moment(data["status_published"]);
            break;
        }

/*
        case 'fbook': {
            post = data['text'];
            id = data.url.split('&id=')[1] +'_'+ data.post_id;
            index = FACEBOOK_INDEX;
            likes = data['likes'];
            comment_count = data['comments'];
            reactions_count = data['reactions'];
            author = data['source'];
            reactions = {
                loves: data['love'],
                wows: data['wow'],
                haha: data['ahah'],
                sad: data['sigh'],
                angry: data['grrr'],
                special:'0',
            };
            url = `https://facebook.com${data.url}`;
            external_url = null
            thumbnail = DEFAULT_THUMBNAIL;
            post_date =  moment(data["date"]);
            break;
        }

        case 'facebook_comments': {
            post = data['comment_message'];
            id = data['comment_id'];
            parent_id = data['status_id'];
            index = FACEBOOK_COMMENTS_INDEX;
            post_date =  moment(data.comment_published)
            break;
        }
  */
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
	    post_type= "video";
            thumbnail = data['thumbnail'];
            view_count = data['viewcount'];
            break;
        }

        case 'youtube_comments': {
            post = data.text;
            id = md5(data.cid);
            parent_id = data.parent_id;
            index = YOUTUBE_COMMENTS_INDEX;
            author = data['author'];
            break;
        }



        case 'instagram': {
            post = data.edge_media_to_caption.edges.length > 0 ? data.edge_media_to_caption.edges[0].node.text : '';
            title = data.title;
            id = data.id;
            index = INSTAGRAM_INDEX;
            likes = data.edge_media_preview_like ? data.edge_media_preview_like.count : data.edge_liked_by,
            comment_count = data.edge_media_to_comment.count,
            author = data.owner.username
            tag = [data.tag];
	    post_type = data.hasOwnProperty('is_video') ? ( data.is_video ? 'video' : 'post' ) : 'post';
            post_date = moment.unix(data.taken_at_timestamp)
            url = "https://www.instagram.com/p/" + data.shortcode
            thumbnail = data.thumbnail_src;
            view_count = data.is_video ? data.video_view_count : null;
            break;
        }

        case 'instagram_comments': {
            post = data.text;
            id = data.id;

            parent_id = data.parent_id;
            index = INSTAGRAM_COMMENTS_INDEX ;
            author = data.owner.username
            post_date = moment.unix(data.created_at)
            break;
        }




        case 'twitter': {
            post = data['tweet'];
            id = data.id;
	    shares = data.retweets_count;
            index = TWITTER_INDEX;
            likes = data.likes_count;
            comment_count = data.replies_count,
            author = data['username']
            url = data['link'] ;
            post_date = moment.unix(data.created_at/1000)
            external_url = JSON.parse(JSON.stringify(data.urls)).slice(1,-1).split(',')[0] ? JSON.parse(JSON.stringify(data.urls)).slice(1,-1).split(',')[0].replace(/["']/g, "") : null;
            thumbnail = JSON.parse(JSON.stringify(data.photos)).slice(1,-1).split(',')[0] ? JSON.parse(JSON.stringify(data.photos)).slice(1,-1).split(',')[0].replace(/["']/g, "") : null;
	    post_type = data.video == 0 ? "post" : "video";
            break;
        }
        case 'twitter_comments': {
            post = data['comment'];
            id = data.id;
            parent_id = data.parent_id;
            index = TWITTER_COMMENTS_INDEX;
            post_date = moment(data.date.split(" ")[0].split("/").reverse().join("-"));
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