const controller = require('../controllers');
module.exports = (app, versioning_url) => {
    //website
    app.post(versioning_url + '/website/articles',  controller.website.addArticle)
    
    //Business 
    app.get(versioning_url + '/clients',  controller.client.list)

    app.get(versioning_url + '/query/:businessId', controller.client.listProjects)
    
    //facebook
    app.post(versioning_url + '/facebook/articles',  controller.facebook.addArticle)
    app.post(versioning_url + '/facebook/bulk-upload', controller.facebook.bulkFacebook)

    //linkedin 
    app.post(versioning_url + '/linkedin/articles',  controller.linkedin.addArticle)

    //tiktok
    app.post(versioning_url + '/tiktok/articles',  controller.tiktok.addArticle)

    //twitter
    app.post(versioning_url + '/twitter/articles',  controller.twitter.addArticle)

    //instagram
    app.post(versioning_url + '/instagram/articles',  controller.instagram.addArticle)

    //youtube
    app.post(versioning_url + '/youtube/articles',  controller.youtube.addArticle)

    //reddit
    app.post(versioning_url + '/reddit/articles',  controller.reddit.addArticle)

    //Export Comments
    app.post(versioning_url + '/export/comments', controller.commentsExports.exports)

    app.post(versioning_url + '/export/comments/link', controller.commentsExports.exportsAndLink)

    // createSheet
    app.post(versioning_url + '/create/new-sheet', controller.commentsExports.createSheet)

    //GetSheets
    app.post(versioning_url + '/get/:project/sheets', controller.commentsExports.getSheet)

    //GetSheets Business
    app.post(versioning_url + '/get/:bussinessId/sheetsForBusiness', controller.commentsExports.getSheetbyBusiness)

    //GetNews
    app.post(versioning_url + '/get/news', controller.commentsExports.getAllNews)

    //News
    app.post(versioning_url + '/news-remove/:id', controller.news.delete)

    //unique url
    app.post(versioning_url + '/check/unique/url', controller.commentsExports.findUniqueUrl)

    //pull pullComments
    app.post(versioning_url + '/pull/comments', controller.importData.pullComments);

    //pull links
    app.get(versioning_url + '/links', controller.links.list);

    //create links
    app.post(versioning_url + '/links', controller.links.create);


};
