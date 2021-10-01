const axios = require('axios');
const redditScraper = ( url ) => new Promise(async (resolve, reject) => {

    try {
        url = `${url}.json`;
        const response = await axios(url);
        if(!response.request._redirectable._redirectCount){

            const {
              id,
              title,
              score: likes,
              created_utc: date,
              num_comments: comments,
              selftext: post,
              author,
              permalink,
              url: external_url

            } = response.data[0].data.children[0].data;

            reddit_post_url = `https://www.reddit.com${permalink}`;
            console.log(id, title, post)
            return resolve({ id, title, post, likes, date, comments, author, url: reddit_post_url, external_url });
        }

    } catch (error) {
        return reject(error);
    }

}) 

module.exports = {
  redditScraper
}