const { addSocialMediaArticle } = require('../libs/data-engine')
const { reddit } = require('../libs/dataset/reddit');
const { pushToElastic } = require('../libs/elastic-functions');
const { queryUpdate } = require('../service/query');
const { dataMapper } = require('../libs/data-maaper');
const { generateNumber } = require('../libs/helper');
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
            let metaData =  reddit(data)
            const responseID =  await addSocialMediaArticle({
                media : 'reddit',
                data : metaData
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

            console.log('error', error);

            res.json({
                done : false
            });

        }
    }
}