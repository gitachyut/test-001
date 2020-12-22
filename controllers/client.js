const Op = require('sequelize').Op
const Business = require('../models').Business;
const Query = require('../models').Query; 

module.exports = {
    list: async (req, res) => {
        return Business
            .findAll({ where: { isDeleted: false }, attributes: { exclude: [
                'revision', 
                'isDeleted', 
                'address',
                'description',
                'logoUrl',
                'config',
                'isActive'
            ] } })
            .then(businesses => {
                businesses.forEach(business => {
                    try { 
                        business.config = JSON.parse(business.config) 
                    } catch (e) { }
                })
                return res.status(200).json(businesses)
            })
    },

    listProjects: async (req, res) => { 
        let businessIds =  req.params.businessId.split(',');
        return Query 
          .findAll({ where: { 
                businessId: {
                    [Op.or]: businessIds
                }
            }, attributes: { exclude: [
                    'query',
                    'boolquery',
                    'meta',
                    'createdAt',
                    'updatedAt',
                    'logs'
                ]}  
            }) 
          .then((query) =>{
                query.forEach(q => {
                    try { 
                        q.deleteQuery = JSON.parse(q.deleteQuery) 
                    } catch (e) { }
                })
                return res.status(200).json(query)
           }) 
    }, 
}
