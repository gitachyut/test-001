const { addSocialMediaArticle } = require('../libs/data-engine')
const { v4: uuidv4 } = require('uuid');
module.exports = {

    addArticle: async (req, res) => {
        try {
            const data = req.body;
            const id = uuidv4();
            data.id = id;
            const responseID =  await addSocialMediaArticle({
                media : 'instagram',
                data : data
            });
            console.log('responseID => ', responseID);
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