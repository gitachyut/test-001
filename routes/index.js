const controller = require('../controllers');
module.exports = (app) => {
    //website
    app.post('/website/articles',  controller.website.addArticle)
    
    //Business 
    app.get('/clients',  controller.client.list)
    app.get('/query/:businessId', controller.client.listProjects)
    
    //facebook
    app.post('/facebook/articles',  controller.facebook.addArticle)

    //linkedin 
    app.post('/linkedin/articles',  controller.linkedin.addArticle)

    //tiktok
    app.post('/tiktok/articles',  controller.tiktok.addArticle)

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

    app.post('/export/comments/link', controller.commentsExports.exportsAndLink)

    // createSheet
    app.post('/create/new-sheet', controller.commentsExports.createSheet)

    //GetSheets
    app.post('/get/:project/sheets', controller.commentsExports.getSheet)

    //GetSheets Business
    app.post('/get/:bussinessId/sheetsForBusiness', controller.commentsExports.getSheetbyBusiness)

    //GetNews
    app.post('/get/news', controller.commentsExports.getAllNews)

    //News
    app.post('/news-remove/:id', controller.news.delete)

    //unique url
    app.post('/check/unique/url', controller.commentsExports.findUniqueUrl)

    //pull pullComments
    app.post('/pull/comments', controller.importData.pullComments);
    
};
