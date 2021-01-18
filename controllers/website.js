const { addSocialMediaArticle } = require('../libs/webhose.data-engine')
const { defaultData } = require('../libs/dataset/web');
const { pushToElastic } = require('../libs/elastic-functions');
const Query = require('../models').Query; 
const { v4: uuidv4 } = require('uuid');
const { queryUpdate } = require('../service/query');
const ES_LINKLIST_INDEX = 'linklist';
const authentication = require("../reporting/authentication");
const { dataMapper } = require('../libs/data-maaper');
const {
    POST_SUMMARY_SHEET
} = require('../config/config');
const { mergeData, appendData, addSheet } = require('../reporting/addSheet');

module.exports = {

    addArticle: async (req, res) => {
        try {
            const data = req.body;
            const projectId = data.projectId;
            const bussinessId = data.bussinessId;
            const id = uuidv4();
            const urlMeta =  new URL(data.url);
            const host = urlMeta.host;
            let metaData = {
                ...defaultData,
                thread: {
                    ...defaultData.thread,
                    uuid: id,
                    site: host,
                    site_full: host,
                    site_section: host,
                    url: data.url,
                    site_type: data.post_type.value,
                    section_title: data.title,
                    title: data.title,
                    title_full: data.title,
                    published: data.postDate
                },
                text: data.post,
                uuid: id,
                published: data.postDate,
                title: data.title,
                url: data.url,
                author: host,
                crawled: data.postDate,
                updated: data.postDate,
                like_count: data.likes,
                comment_count: data.comment_count
            };


            metaData.exportInitiated = false;
            metaData.exportLink = null;

            const responseID =  await addSocialMediaArticle({
                media : 'web',
                data : metaData
            });

            if(projectId){
                queryUpdate(projectId, responseID);
            }


            if(data.spreadsheetId){
                const auth = await authentication.authenticate();
                const values = dataMapper(data);

                if(data.customSheet){
                    if(data.newSheet){
                        const newSheet = await addSheet(auth, data.sheetName , data.spreadsheetId.value );
                        let newSheetData = [];
                        newSheetData.push([
                            'Post Date', 
                            'View Comments', 
                            'Language', 
                            'Media', 
                            'Caption in Post', 
                            'Summary/Translation',
                            'Views',
                            'Comments',
                            'Likes',
                            'Shares',
                            'Author',
                            'Post Type',
                            'Link'
                        ]);
                        await appendData(auth, data.sheetName , newSheetData, data.spreadsheetId.value);
                        await mergeData(auth, data.sheetName, values, data.spreadsheetId.value);
                    }else{
                        await mergeData(auth, data.sheetName, values, data.spreadsheetId.value);
                    }
                }else{
                    await mergeData(auth, POST_SUMMARY_SHEET, values, data.spreadsheetId.value);
                }
            }

            res.json({
                done : true,
                id: responseID
            });

        } catch (error) {
            res.json({
                done : false
            })
        }
    }
}

