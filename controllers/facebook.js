const { addSocialMediaArticle } = require("../libs/data-engine");
const { initiateDownload } = require("../reporting/download");
const { facebook } = require("../libs/dataset/facebook");
const { dataMapper } = require("../libs/data-maaper");
const { pushToElastic } = require("../libs/elastic-functions");
const { queryUpdate } = require("../service/query");
const { generateNumber } = require("../libs/helper");
const authentication = require("../reporting/authentication");
const { POST_SUMMARY_SHEET } = require("../config/config");
const { mergeData, appendData, addSheet } = require("../reporting/addSheet");
const { v4: uuidv4 } = require("uuid");
const ES_LINKLIST_INDEX = "linklist";
const { SHEETCOLUMN } = require("../libs/helper/sheet-column");
const FbScrape = require("../social-media/facebook/post");

module.exports = {
  addArticle: async (req, res) => {
    try {
      const data = req.body;
      const projectId = data.projectId;
      const bussinessId = data.bussinessId;

      const id = generateNumber(3);
      data.id = id;
      let metaData = facebook(data);

      if (parseInt(data.comments) > 200000000000) {
        let exportLink = await initiateDownload(data.url);
        metaData.exportInitiated = true;
        metaData.exportLink = exportLink;
      } else {
        metaData.exportInitiated = false;
      }

      const responseID = await addSocialMediaArticle({
        media: "facebook",
        data: metaData,
      });

      if (projectId) {
        queryUpdate(projectId, responseID);
      }

      if (data.spreadsheetId) {
        const auth = await authentication.authenticate();
        const values = dataMapper(data);

        if (data.customSheet) {
          if (data.newSheet) {
            const newSheet = await addSheet(
              auth,
              data.sheetName,
              data.spreadsheetId.value
            );
            let newSheetData = [];
            newSheetData.push(SHEETCOLUMN);
            await appendData(
              auth,
              data.sheetName,
              newSheetData,
              data.spreadsheetId.value
            );
            await mergeData(
              auth,
              data.sheetName,
              values,
              data.spreadsheetId.value
            );
          } else {
            await mergeData(
              auth,
              data.sheetName,
              values,
              data.spreadsheetId.value
            );
          }
        } else {
          await mergeData(
            auth,
            POST_SUMMARY_SHEET,
            values,
            data.spreadsheetId.value
          );
        }
      }
      res.json({
        done: true,
        id: responseID,
      });
    } catch (error) {
      console.log("error", error);

      res.json({
        done: false,
      });
    }
  },

  bulkFacebook: async (req, res) => {
    let { urls, type } = req.body;
    var interval = 10000;
    urls = urls.split(/\r?\n/).filter(Boolean);

    urls.forEach(function (url, index) {
      setTimeout(function () {
        url = url.split("?__cft__[0]=")[0];
        url = url.split("&__cft__[0]=")[0];
        if (!type) {
          type = "post";
        }
        const fbScrape = new FbScrape();
        fbScrape.getPosts(url, type).then(async (articlePost) => {
          console.log(articlePost);
          // Process start here!
          const data = req.body;
          const projectId = data.projectId;
          const bussinessId = data.bussinessId;

          const id = generateNumber(3);
          data.id = articlePost.postID || id;

          data.author = articlePost.username ?  articlePost.username.trim() : articlePost.userfullname.trim();
          var datetime = new Date();
          data.postDate = articlePost.time ? articlePost.time.date_time : datetime;
          data.id = articlePost.postID || id;
          data.post_type.value = articlePost.type || 'Post';
          data.post = articlePost.post +"\n"+ articlePost.sharedText;
          data.title = articlePost.title;
          data.likes = articlePost.like_count ? parseInt(articlePost.like_count) : 0;
          data.shares = articlePost.share_count ? parseInt(articlePost.share_count) : 0;
          data.comments =  articlePost.comment_count ? parseInt(articlePost.comment_count) : 0,
          data.views = 0;
          data.url = articlePost.url;

          let metaData = facebook(data);

          metaData.exportInitiated = false;

          const responseID = await addSocialMediaArticle({
            media: "facebook",
            data: metaData,
          });

          if (projectId) {
            queryUpdate(projectId, responseID);
          }

          if (data.spreadsheetId) {
            const auth = await authentication.authenticate();
            const values = dataMapper(data);

            if (data.customSheet) {
              if (data.newSheet) {
                const newSheet = await addSheet(
                  auth,
                  data.sheetName,
                  data.spreadsheetId.value
                );
                let newSheetData = [];
                newSheetData.push(SHEETCOLUMN);
                await appendData(
                  auth,
                  data.sheetName,
                  newSheetData,
                  data.spreadsheetId.value
                );
                await mergeData(
                  auth,
                  data.sheetName,
                  values,
                  data.spreadsheetId.value
                );
              } else {
                await mergeData(
                  auth,
                  data.sheetName,
                  values,
                  data.spreadsheetId.value
                );
              }
            } else {
              await mergeData(
                auth,
                POST_SUMMARY_SHEET,
                values,
                data.spreadsheetId.value
              );
            }
          }
        // Process ends here!

        });
      }, index * interval);
    });
    res.json({ start: "true" });
  },
};
