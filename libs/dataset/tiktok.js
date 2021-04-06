let dataset = (data) => ({
    "title": data.title,
    "author": data.author.trim(),
    "likes": data.likes ? parseInt(data.likes) : 0,
    "comments": data.comments ? parseInt(data.comments) : 0,
    "viewcount": data.views ? parseInt(data.views) : 0,
    "shares": data.shares ? parseInt(data.shares) : 0,
    "description": `${data.post}`,
    "post_type": data.post_type.value,
    "postId": data.id,
    "url": data.url,
    "publishedAt": data.postDate
})

module.exports = {
    tiktok: dataset
};
