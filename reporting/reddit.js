const axios = require('axios');
var moment = require("moment");
const { pushToElastic, checkDoc, updateComments } = require('../libs/elastic-functions');
const ES_COMMENTS_INDEX = 'comments';

const getRedditComments =  async (link, existingSheet, postID, postMedia, projectId) => new Promise(async (resolve, reject) => {
    let originalUrl = link;
    let results;
    let xc = false;
    let esOutput=[];
    let esOutput2 = [];
    link = link.substring(0, link.length - 1); 
    link = `${link}.json`;
    if(existingSheet !== 'false' && existingSheet !== '' && existingSheet){
	xc = true;
        results = [
            [ '' ],
            [ 'Post Link', originalUrl, '' ]
        ];
    }else{
        results = [
            [ 'Item', 'Hot Link' ],
            [ 'Post Summary', 'Post Summary' ],
            [ 'Comment Summary', 'Comment Summary' ],
            [ 'Post Link', originalUrl, '' ],
            [ '' ],
            [ '' ],
            ['postID','Sequence', 'Date', 'Comment','Relevancy', 'Sentiment']
        ];
    }

    try {
        
        let res = await axios.get(link)
        let json = res.data
        var post = json[0].data.children[0].data;
    
        if (["", "default", "self", "nsfw"].indexOf(post.thumbnail) > -1) {
            post.thumbnail = undefined;
        }
    
        // humanize timestamp
        post.created_utc = moment.unix(post.created_utc).locale("en").fromNow();
    
        // replace 'likes' with 1,0 or -1 so that it's easy to use its value while rendering templates
        if (post.likes) {
            post.likes = 1;
        } else if (post.likes == null) {
            post.likes = 0;
        } else {
            post.likes = -1;
        }
    

        /**
         * Parse comments
         */
    
        var parseComments = function (thread, level) {
            if (thread.kind == "t1") {
                var comment = {body: thread.data.body,
                    score: thread.data.score,
                    likes: thread.data.likes,
                    author: thread.data.author,
                    name: thread.data.name,
                    created_utc: thread.data.created_utc,
                    level: level
                };
    
                // humanize timestamp
                comment.created_utc = moment.utc(moment.unix(comment.created_utc)).locale("en").fromNow();
    
                // replace 'likes' with 1,0 or -1 so that it's easy to use its value while rendering templates
                if (comment.likes) {
                    post.likes = 1;
                } else if (comment.likes == null) {
                    comment.likes = 0;
                } else {
                    comment.likes = -1;
                }

                var incx = xc ? results.length - 1 : results.length - 6;
                let final = [
		    postID,
                    incx,
                    comment.created_utc,
                    comment.body 
                ];
           
		console.log('final', final);

                results.push(final)
                esOutput.push({
                    sequence: (results.length + 1).toString(),
                    date: comment.created_utc,
                    comment: comment.body || '',
                    sentiment: 'Neutral'
                })

		 esOutput2.push({
                    sequence: (results.length + 1).toString(),
                    comment: comment.body || '',
                    sentiment: 'Neutral'
                })

                if (thread.data.replies) {
                    level++;
                    thread.data.replies.data.children.forEach(function (thread) {
                        parseComments(thread, level);
                    });
                }
            }
        };



        json[1].data.children.forEach(async function (thread,i) {

            parseComments(thread, 0);

            if( i+1 ==  json[1].data.children.length ){
                // none
		 let ifDocExist = await checkDoc(ES_COMMENTS_INDEX, postID);
                if(ifDocExist){
                    let postComment = {
                        [projectId]: esOutput2
                    }
                   await updateComments(ES_COMMENTS_INDEX, postID, postComment);
                }else{
                    let postComment = {
                        id: postID,
                        media: postMedia,
                        [projectId]: esOutput
                    }
                    let postComment2 = {
                        id: postID,
                        media: postMedia,
                        [projectId]: esOutput2
                    }
                  await pushToElastic(ES_COMMENTS_INDEX, postID, postComment2);
                }
                resolve(results);

            }else{

                let ifDocExist = await checkDoc(ES_COMMENTS_INDEX, postID);
                if(ifDocExist){
                    let postComment = {
                        [projectId]: esOutput2
                    }
                   await updateComments(ES_COMMENTS_INDEX, postID, postComment);
                }else{
                    let postComment = {
                        id: postID,
                        media: postMedia,
                        [projectId]: esOutput
                    }
		    let postComment2 = {
                        id: postID,
                        media: postMedia,
                        [projectId]: esOutput2
                    }
                  await pushToElastic(ES_COMMENTS_INDEX, postID, postComment2);
                }
                resolve(results);
            }
        });

    } catch (error) {
        reject(error)
    }
   

}) 

// https://www.reddit.com/r/TwoXChromosomes/comments/kci3w8/chinese_characters_have_a_misogynistic_problem/
// https://www.reddit.com/r/singapore/comments/kcsjpy/i_notice_race_is_a_variable_involved_in_this/
// let link = 'https://www.reddit.com/r/singapore/comments/kcsjpy/i_notice_race_is_a_variable_involved_in_this/'
// getComments(link)

module.exports = {
    getRedditComments
}

