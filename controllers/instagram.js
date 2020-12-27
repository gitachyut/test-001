const { addSocialMediaArticle } = require('../libs/data-engine')
const { instagram } = require('../libs/dataset/instagram');
const { pushToElastic } = require('../libs/elastic-functions');
const { queryUpdate } = require('../service/query');
const { dataMapper } = require('../libs/data-maaper');
const { generateNumber } = require('../libs/helper');
const authentication = require("../reporting/authentication");
const {
    POST_SUMMARY_SHEET
} = require('../config/config');
const { mergeData } = require('../reporting/addSheet');
const { v4: uuidv4 } = require('uuid');
const ES_LINKLIST_INDEX = 'linklist';

module.exports = {
    addArticle: async (req, res) => {
        try {
            const data = req.body;
            const projectId = data.projectId;
            const bussinessId = data.bussinessId;
            const id = generateNumber(6);
            data.id = id;
            let metaData =  instagram(data)
            const responseID =  await addSocialMediaArticle({
                media : 'instagram',
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