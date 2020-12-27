const { addSocialMediaArticle } = require('../libs/data-engine');
const { youtube } = require('../libs/dataset/youtube');
const { pushToElastic } = require('../libs/elastic-functions');
const { queryUpdate } = require('../service/query');
const { dataMapper } = require('../libs/data-maaper');
const { v4: uuidv4 } = require('uuid');
const authentication = require("../reporting/authentication");
const {
    POST_SUMMARY_SHEET
} = require('../config/config');
const { mergeData } = require('../reporting/addSheet');
const ES_LINKLIST_INDEX = 'linklist';

module.exports = {
    addArticle: async (req, res) => {
        try {
            const data = req.body;
            const projectId = data.projectId;
            const bussinessId = data.bussinessId;

            const id = uuidv4();
            data.id = id;
            let metaDate = youtube(data);
            const responseID =  await addSocialMediaArticle({
                media : 'youtube',
                data : metaDate
            });
            queryUpdate(projectId, responseID);
            
            const auth = await authentication.authenticate();
            const values = dataMapper(data);
            mergeData(auth, POST_SUMMARY_SHEET, values, data.spreadsheetId.value);


            res.json({
                done : true,
                id: responseID
            });

        }catch(error){

            res.json({
                done : false
            });

        }
    }
}