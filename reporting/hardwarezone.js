const axios = require('axios');
const cheerio = require('cheerio');
const { pushToElastic, checkDoc, updateComments } = require('../libs/elastic-functions');
const ES_COMMENTS_INDEX = 'comments';


const hzPaginationRemover = (url) => {
    url = url.split('/page-')[0];
    return url.replace(/\/+$/, '');
}

const hardwarezoneScraper = (url, existingSheet, postID, postMedia, projectId) => new Promise(async (resolve, reject) => {
    const original_url = hzPaginationRemover(url);
    let results, inc = 1;
    let esOutput = [];
    let esOutput2 = [];
    if (existingSheet !== 'false' && existingSheet !== '' && existingSheet) {
        results = [
            [''],
            ['Post Link', original_url, '']
        ];
    } else {
        results = [
            ['Item', 'Hot Link'],
            ['Post Summary', 'Post Summary'],
            ['Comment Summary', 'Comment Summary'],
            ['Post Link', original_url, ''],
            [''],
            [''],
            ['postID', 'Sequence', 'Date', 'Comment', 'Relevancy', 'Sentiment']
        ];
    }

    const runner = (url) => {
        try {
            axios(url)
                .then(async (response) => {
                    if ( response.request._redirectable._currentUrl.replace(/\/+$/, '') === url ) {
                        console.log('url', url);
                        const html = response.data;
                        const $ = cheerio.load(html);

                        const statsTables = $('.message.message--post.js-post.js-inlineModContainer');
                        
                        statsTables.each(function () {
                            let sequenceWraper = $(this).find('.message-attribution-opposite.message-attribution-opposite--list');
                            let sequence = sequenceWraper.find('li').text().trim().replace(/\s/g,'').split('#')[1];
                            let dateWraper = $(this).find('time');
                            let date = dateWraper.text().trim();
                            const comment = $(this).find('.bbWrapper').text().trim()

                            results.push(
                                [
                                    postID,
                                    parseInt(sequence),
                                    date,
                                    comment
                                ]
                            );

                            esOutput.push({
                                sequence: parseInt(sequence.split('#')[1]).toString(),
                                date: date,
                                comment: comment || '',
                                sentiment: 'Neutral'
                            })

                            esOutput2.push({
                                sequence: parseInt(sequence.split('#')[1]).toString(),
                                comment: comment || '',
                                sentiment: 'Neutral'
                            })

                        })

                        inc++;
                        url = url.split('/page-')[0] + '/page-' + inc;
                        setTimeout(function () {
                            runner(url);
                        }, 1500);

                    } else {
                        let ifDocExist = await checkDoc(ES_COMMENTS_INDEX, postID);
                        if (ifDocExist) {
                            //			    console.log("exist");
                            let postComment = {
                                [projectId]: esOutput2
                            }
//                            await updateComments(ES_COMMENTS_INDEX, postID, postComment);
                        } else {
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

//                            await pushToElastic(ES_COMMENTS_INDEX, postID, postComment2);
                        }
                        resolve(results);
                    }
                })
                .catch(err => reject(err))
        } catch (error) {
            reject(error);
        }
    }
    runner(original_url);
})

// https://forums.hardwarezone.com.sg/eat-drink-man-woman-16/mask-collection-dec-6413139-7.html
// https://forums.hardwarezone.com.sg/eat-drink-man-woman-16/next-toto-5m-6437295.html 
// let original_url = paginationRemover('https://forums.hardwarezone.com.sg/eat-drink-man-woman-16/mask-collection-dec-6413139-999.html');

module.exports = {
    hardwarezoneScraper,
    hzPaginationRemover
};
