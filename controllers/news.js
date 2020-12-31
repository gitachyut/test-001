const { deleteDoc } = require('../libs/elastic-functions');
const { assignQueryUpdate } = require('../service/query');

module.exports = {
    delete: async (req, res) => {

        let {
            index,
            type,
            id
        } = req.body;

        try {
            let res = await deleteDoc({
                index,
                type,
                id
            });
            res.json({
                done: true
            });
        } catch (error) {
            res.json({
                done: false
            });
        }

    },

    assignNews: async (req,res) => {
        let {
            projectId,
            id, 
            removeNassign,
            assignToo
        } = req.body;

        if(projectId && id){
            if(removeNassign)
                queryUpdate(projectId, responseID, true);
            else   
                queryUpdate(projectId, responseID, false); 
        }
    }
}