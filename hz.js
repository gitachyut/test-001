const axios = require('axios');
const cheerio = require('cheerio');


const hzPaginationRemover = (url) => {
    url = url.split('/page-')[0];
    return url.replace(/\/+$/, '');
}

const hardwarezoneScraper = (url) => {
    
    const original_url = hzPaginationRemover(url);
    let results, inc = 1;
    

    const runner = (url) => {

        try {
            axios(url)
                .then(async (response) => {
                    // console.log('response', response.request._redirectable._redirectCount)
                    if (response.request._redirectable._currentUrl.replace(/\/+$/, '') === url ) {
                        console.log('here!', response.request._redirectable._currentUrl)


                        const html = response.data;
                        const $ = cheerio.load(html);
                        const statsTables = $('.message.message--post.js-post.js-inlineModContainer');
                        statsTables.each(function () {
                            let sequenceWraper = $(this).find('.message-attribution-opposite.message-attribution-opposite--list');
                            let sequence = sequenceWraper.find('li').text().trim().replace(/\s/g,'').split('#')[1];
                            let dateWraper = $(this).find('time');
                            let date = dateWraper.text().trim();
                            const comment = $(this).find('.bbWrapper').text().trim()

                            console.log(sequence, date, comment);
                        })

                        inc++;
                        url = url.split('/page-')[0] + '/page-' + inc;
                        setTimeout(function () {
                            runner(url);
                        }, 1500);



                    } 
                })
                .catch(err => console.log(err))
        } catch (error) {
            reject(error);
        }
    }
    runner(original_url);
}

// https://forums.hardwarezone.com.sg/eat-drink-man-woman-16/mask-collection-dec-6413139-7.html
// https://forums.hardwarezone.com.sg/eat-drink-man-woman-16/next-toto-5m-6437295.html 
// let original_url = paginationRemover('https://forums.hardwarezone.com.sg/eat-drink-man-woman-16/mask-collection-dec-6413139-999.html');
// https://forums.hardwarezone.com.sg/threads/some-tips-to-navigate-boards-pcw.6489501/page-2

let url= "https://forums.hardwarezone.com.sg/threads/some-tips-to-navigate-boards-pcw.6489501/page-2";
hardwarezoneScraper(url)

