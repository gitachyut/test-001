const rp = require('request-promise-native'); // requires installation of `request`
const cheerio = require('cheerio');
const date_service = require('../../../service/date.js');
class FbScrape {
    constructor(options={}) {
        this.headers = options.headers || {
            'User-Agent': 'Mozilla/5.0 (X11; Fedora; Linux x86_64; rv:64.0) Gecko/20100101 Firefox/64.0', // you may have to update this at some point
            'Accept-Language': 'en-US,en;q=0.5',
            'cookie': 'locale=en_US;',
        };
    }


    async getPosts(pageUrl) {
        const staticPostsHtml = await rp.get({ 
            url: pageUrl, 
            headers: this.headers
        });
        let staticPosts = this._parsePostsHtml(staticPostsHtml, pageUrl);
        return staticPosts;
    }


    async _parsePostsHtml(postsHtml, pageUrl) {

        const $ = cheerio.load(postsHtml);
        return $.html();

        try {
            // return $.html()
            const postWrapper = $('.story_body_container:first');
            const post = postWrapper.find('._5rgt._5nk5').text();
            const sharedText = postWrapper.find('._24e4._2xbh').text();
            const username = postWrapper.find('h3 strong a').text();
            const time = await date_service(postWrapper.find('abbr:first').text());
            return { post,sharedText, username, time };
        } catch (error) {

            return { null: true };

        }

    }



}

const fbScrape = new FbScrape();

fbScrape.getPosts('https://www.youtube.com/watch?v=jvnayc1-b1c').then(posts => { 
    console.log(posts)
    // for (const post of posts) {
    //     console.log(post.created_at, post.message);
    // }
});
