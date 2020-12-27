const controller = require('../controllers');
module.exports = (app) => {
    //website
    app.post('/website/articles',  controller.website.addArticle)
    
    //Business 
    app.get('/clients',  controller.client.list)
    app.get('/query/:businessId', controller.client.listProjects)
    
    //facebook
    app.post('/facebook/articles',  controller.facebook.addArticle)

    //twitter
    app.post('/twitter/articles',  controller.twitter.addArticle)

    //instagram
    app.post('/instagram/articles',  controller.instagram.addArticle)

    //youtube
    app.post('/youtube/articles',  controller.youtube.addArticle)

    //reddit
    app.post('/reddit/articles',  controller.reddit.addArticle)

    //Export Comments
    app.post('/export/comments', controller.commentsExports.exports)

    // createSheet
    app.post('/create/new-sheet', controller.commentsExports.createSheet)

    //GetSheets
    app.post('/get/:project/sheets', controller.commentsExports.getSheet)

    //GetNews
    app.post('/get/news', controller.commentsExports.getAllNews)

    //unique url
    app.post('/check/unique/url', controller.commentsExports.findUniqueUrl)
    
};
