let dataset = (data) => ({
    "title": data.title,
    "author": data.author,
    "length": null,
    "duration": 500,
    "likes": data.likes ? parseInt(data.likes) : 0,
    "comments": data.comments ? parseInt(data.comments) : 0,
    "dislikes": 0,
    "viewcount": data.views ? parseInt(data.views) : 0,
    "rating": null,
    "description": data.post,
    "videoId": data.id,
    "url": data.url,
    "publishedAt": data.postDate
})

module.exports = {
    youtube: dataset
};