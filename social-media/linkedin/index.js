var linkedinScraper = require('linkedin-scraper');
var url = 'https://www.linkedin.com/feed/update/urn:li:activity:6778156324132847616/';

linkedinScraper(url, function(err, profile) {
    if (err) {
        console.log(err);
    } else {
        console.log(profile);
    }
});
