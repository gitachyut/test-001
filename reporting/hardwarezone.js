const axios = require('axios');
const cheerio = require('cheerio');
const { pushToElastic, checkDoc, updateComments } = require('../libs/elastic-functions');
const ES_COMMENTS_INDEX = 'comments';


const hzPaginationRemover = (url) => {
    url = url.split(/(-\b([1-9]|[1-9][0-9]||[1-9][0-9][0-9]|1000)\b\.\bhtml\b)/)[0].split('.html');
    return `${url[0]}.html`;
}

const hardwarezoneScraper = (url, existingSheet, postID, postMedia, projectId) => new Promise(async ( resolve, reject )=> {
    const original_url = hzPaginationRemover(url);
    let results, inc = 1;
    let esOutput = [];

    if(existingSheet !== 'false' && existingSheet !== '' && existingSheet){
        results = [
            [ '' ],
            [ 'Post Link', original_url , '' ]
        ];
    }else{
        results = [
            [ 'Item', 'Hot Link' ],
            [ 'Post Summary', 'Post Summary' ],
            [ 'Comment Summary', 'Comment Summary' ],
            [ 'Post Link', original_url , '' ],
            [ '' ],
            [ '' ],
            ['Sequence', 'Date', 'Comment','Relevancy', 'Sentiment']
        ];
    }

    const runner = (url) => {
        try {
            axios(url)
            .then( async (response) => {
                if(!response.request._redirectable._redirectCount){  
                    console.log('url', url);            
                    const html = response.data;
                    const $ = cheerio.load(html);
                    const statsTables = $('.post-wrapper');
                    statsTables.each(function () {
                        let sequenceWraper = $(this).find('.thead:last');
                        let sequence = sequenceWraper.text().trim();
                        let dateWraper = $(this).find('.thead:first');
                        let date = dateWraper.text().trim();
                        const comment = $(this).find('.post_message').text().trim()

                        results.push(
                            [
                                parseInt( sequence.split('#')[1] ),
                                date,
                                comment
                            ]
                        );

                        esOutput.push({
                            sequence: parseInt( sequence.split('#')[1] ).toString(),
                            date: date,
                            comment: comment || '',
                            sentiment: 'Neutral'
                        })


                    })

                    inc++;
                    url = original_url.split('.html');
                    url = url[0] + '-' + inc + '.html';
                    setTimeout(function(){
                        runner(url);
                    }, 1500);
    
                }else{
                    let ifDocExist = await checkDoc(ES_COMMENTS_INDEX, postID);
                    if(ifDocExist){
                        let postComment = {
                            [projectId]: esOutput
                        }
                        await updateComments(ES_COMMENTS_INDEX, postID, postComment);
                    }else{
                        let postComment = {
                            id: postID,
                            media: postMedia,
                            [projectId]: esOutput
                        }
                        await pushToElastic(ES_COMMENTS_INDEX, postID, postComment);
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
}