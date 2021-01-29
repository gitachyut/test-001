const { addSocialMediaArticle } = require('../libs/data-engine');
const { initiateDownload } = require('../reporting/download'); 
const { youtube } = require('../libs/dataset/youtube');
const { pushToElastic } = require('../libs/elastic-functions');
const { queryUpdate } = require('../service/query');
const { dataMapper } = require('../libs/data-maaper');
const { v4: uuidv4 } = require('uuid');
const authentication = require("../reporting/authentication");
const {
    POST_SUMMARY_SHEET
} = require('../config/config');
const { mergeData, appendData, addSheet } = require('../reporting/addSheet');
const ES_LINKLIST_INDEX = 'linklist';


module.exports = {
    addArticle: async (req, res) => {
        try {
            const data = req.body;
            const projectId = data.projectId;
            const bussinessId = data.bussinessId;
           
            const id = uuidv4();
            data.id = id;
            let metaData = youtube(data);

            let exportLink = await initiateDownload(data.url)
            metaData.exportInitiated = true;
            metaData.exportLink = exportLink;


            const responseID =  await addSocialMediaArticle({
                media : 'youtube',
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

        }catch(error){
		console.log(error);
            res.json({
                done : false
            });

        }
    }
}
