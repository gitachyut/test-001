const { addSocialMediaArticle } = require('../libs/data-engine')
const { instagram } = require('../libs/dataset/instagram');
const { pushToElastic } = require('../libs/elastic-functions');
const { queryUpdate } = require('../service/query');
const { generateNumber } = require('../libs/helper');
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
            const _X = {
                id,
                ...data,
                createdAt: new Date()
            };

            let metaData =  instagram(data)
            const responseID =  await addSocialMediaArticle({
                media : 'instagram',
                data : metaData
            });

            console.log('responseID => ', responseID);
            pushToElastic(ES_LINKLIST_INDEX, id, _X);
            queryUpdate(projectId, responseID);

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