const Op = require('sequelize').Op
const Links = require('../models').Links;
const moment = require('moment'); 

module.exports = {
    
    list: async (req, res) => {
        console.log('hello')
        return Links
            .findAll()
            .then( links => res.json(links) )
    },

    create: async (req,res) => {
        try {
            const link = await Links.create({
                link: "https://www.facebook.com/shristi.kashyap.9461/posts/1211153389320669",
                media: "facebook",
                businessId: "28",
                projectId: "06865f20-0c83-11ea-8bec-afa94ca69b7b",
                date: moment().format(),
                isComplete: 0,
                isError: 0
            });
            res.json({ done: true });
        } catch (error) {
            console.log(error);
            res.send('error');
        }

    }
}
