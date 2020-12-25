var moment = require('moment-timezone');
// { 
//     source: 'TemasekFoundation',
//     utime: '1608702843',
//     post_id: '3254173518142489',
//     Post_Type: 'post',
//     text:
//     'The pandemic showed us the risks on our physical health, but what are the effects on our mental health?In the pilot episode of Momentum Tea, the first talk show series hosted by Temasek Foundation, Jason Chua and Hung Zhen Long from Beng Who Cooks and Tracie Pang of Pangdemonium spoke candidly about managing mental health during these uncertain times. Chiming in were our host Serene Goh from What Are You Doing SG and Jennifer Lewis from Temasek Foundation.Momentum Tea seeks to bring together more voices to discuss social issues and create the momentum to take action in caring for our communities.',
//     Like: '26',
//     Haha: '0',
//     Love: '0',
//     Wow: '0',
//     Sad: '0',
//     Angry: '0',
//     Shares: '2',
//     Comment_Count: '4',
//     Total_Page_Likes: '0',
//     Total_Page_Follows: '0' 
// }

let dataset = (data) => {
    return { 
        source: data.author,
        utime: moment(data.postDate, "YYYY-MM-DDTHH:mm:ss.SSSZZ"),
        post_id: data.id,
        Post_Type: data.post_type.value,
        text: data.post,
        title: data.title,
        Like: data.likes ? parseInt(data.likes) : 0,
        Shares: data.shares ? parseInt(data.shares) : 0,
        Comment_Count: data.comments ? parseInt(data.comments) : 0,
        Views: data.views ? parseInt(data.views) : 0,
        Url : data.url
    }
};

module.exports = {
    facebook: dataset
};