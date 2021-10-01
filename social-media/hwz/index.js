const axios = require('axios');
const cheerio = require('cheerio');
const date_service = require('../../../service/date.js');

const paginationRemover = (url) => {
    url = url.split('/page-')[0];
    return url.replace(/\/+$/, '');
}

const commentCountFinder = async (url) => new Promise(async (resolve, reject)=>{
    let commentCount = 0, inc = 1;
    let mainUrl = url;
    const runner = async (url) => {

        try {
            const response = await axios(url);
            if ( response.request._redirectable._currentUrl.replace(/\/+$/, '') === url ) {
                const html = response.data;
                const $ = cheerio.load(html);
                const statsTables = $('.message.message--post.js-post.js-inlineModContainer');
                commentCount = commentCount + statsTables.length;
                inc++;
                url = url.split('/page-')[0] + '/page-' + inc;
                setTimeout(function () {
                    runner(url);
                }, 1500);
            } else {
                return resolve(commentCount);
            }
        } catch (error) {
            reject(error);
        }
    };
    runner(mainUrl);
}) 

const hardwarezoneScraper = (url) => new Promise(async (resolve, reject) => {
    try {
        url = paginationRemover(url);
        const response = await axios(url);
        const html = response.data;
        const $ = cheerio.load(html);
        // Title
        
        // Likes
        // let likes = $('.vbseo-likes-count').text().trim().split('Likes')[0];
        // likes = parseInt(likes) || 0;
        // Date
        const statsTables = $('.p-body-header');
        const title = statsTables.find('.p-title-value').text().trim();
        let dateWraper = statsTables.find('.u-dt:first');
        let date = dateWraper.text().trim();
        date = await date_service(date);
        // Comment Count
        let commentCount = await commentCountFinder(url);
        console.log(title)
        // Response
        return resolve({ title, post: title, likes: 0, date, comment: commentCount });

    } catch (error) {
        console.log(error)
        return reject(error);
    }

})

module.exports = {
    hardwarezoneScraper
}