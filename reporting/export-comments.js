const request = require('request');
const APITOKEN = '7e2d8c0eaccd1e81d8b1ee121ee3031ce9e83bf32897ae995c420d737e4024c0';

const initiateCommentsDownloader = (url, media, type = null) => new Promise((resolve, reject) => {
    let options;
    if(media === 'twitter'){
        options = {
            url: `https://exportcomments.com/api/v2/export?url=${url}&replies=true&nested=true&twitterType=Tweets`,
            method: 'PUT',
            headers: {
                'X-AUTH-TOKEN': APITOKEN
            }
        };
    }else{
        options = {
            url: `https://exportcomments.com/api/v2/export?url=${url}&replies=true&nested=true`,
            method: 'PUT',
            headers: {
                'X-AUTH-TOKEN': APITOKEN
            }
        };
    }
    request(options, function(err, res, body) {
        if(err){
            console.log(err);
            reject(err);
        }else{
            let json = JSON.parse(body);
            console.log(json)
            resolve(json);
        }
    });
})

const checkStatus = (id) => new Promise((resolve, reject) => {
    const options = {
        url: `https://exportcomments.com/api/v2/export?guid=${id}`,
        method: 'GET',
        headers: {
            'X-AUTH-TOKEN': APITOKEN
        }
    };
    request(options, function(err, res, body) {
        if(err){
            console.log("error:", err);
            reject(err);
        }else{
            let json = JSON.parse(body);
            resolve(json);
        }
    });
})


module.exports = {
    initiateCommentsDownloader,
    checkStatus
}