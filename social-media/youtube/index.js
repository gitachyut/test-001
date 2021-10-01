const youtube = require('scrape-youtube').default;
const date_service = require('../../../service/date.js');

youtube.search('https://www.youtube.com/watch?v=unPu1wgIr2g').then( async results => {
    const date = await date_service("1 years ago");
    results.videos[0].uploaded = date;
    console.log(results.videos[0]); 
});