const { addSocialMediaArticle } = require('../libs/data-engine')
const { initiateDownload } = require('../reporting/download'); 
const { twitter } = require('../libs/dataset/twitter');
const { pushToElastic } = require('../libs/elastic-functions');
const { queryUpdate } = require('../service/query');
const { generateNumber } = require('../libs/helper');
const { dataMapper } = require('../libs/data-maaper');
const { v4: uuidv4 } = require('uuid');
const authentication = require("../reporting/authentication");
const {
    POST_SUMMARY_SHEET
} = require('../config/config');
const { mergeData, appendData, addSheet } = require('../reporting/addSheet');
const ES_LINKLIST_INDEX = 'linklist';
const { SHEETCOLUMN }  = require('../libs/helper/sheet-column');


module.exports = {
    addArticle: async (req, res) => {
        try {
            const data = req.body;
            const projectId = data.projectId;
            const bussinessId = data.bussinessId;
            const id = generateNumber(6);
            data.id = id;
            let metaData =  twitter(data)


            if(parseInt( data.comments ) > 5000000000000000){
            	let exportLink = await initiateDownload(data.url)
            	metaData.exportInitiated = true;
           	 metaData.exportLink = exportLink;
	    }else{
                metaData.exportInitiated = false;
            }

            const responseID =  await addSocialMediaArticle({
                media : 'twitter',
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
                        newSheetData.push(SHEETCOLUMN);
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

            console.log('error', error);

            res.json({
                done : false
            });

        }
    }
}
