const { startDownload } = require('../reporting/download');
const { pushToElastic } = require('../libs/elastic-functions');
var request = require('request-promise-native')
const { createSheetNAssignUser } = require('../reporting/permission');
const { v4: uuidv4 } = require('uuid');
const { errors } = require('@elastic/elasticsearch');
const ES_GOOGLE_INDEX = 'googlesheets';

module.exports = {
    exports: async (req, res) => {

        const {
            url,
            sheetName,
            spreadsheetId,
            workSheetName,
            existingSheet,
            projectId,
            bussinessId
        } = req.body;
    
        const sheetMeta = { 
          spreadsheetId: spreadsheetId,
          workSheetName:  workSheetName || null,
          existingSheet: existingSheet 
        }
        
        const id = uuidv4();
        let x = {
            id,
            url,
            sheetName,
            spreadsheetId,
            workSheetName,
            projectId,
            bussinessId
        };
        try {
            startDownload( url, sheetName, sheetMeta )
                    .then(async ( data ) => {
                        pushToElastic(ES_GOOGLE_INDEX, id, x);
                        res.json({
                            done: true
                        }); 
                    }) 
                    .catch(async err => {
                        res.json({
                            fail: true
                        })
                    })
        } catch (error) {
            console.log(error)
        }


    },

    createSheet: async (req, res) => {
        try {

            const {
                workSheetName,
                emails
            } = req.body;
    
            let emailIds = emails.replace(/^\s+|\s+$/g,"").split(/\s*,\s*/);
    
            console.log(workSheetName, emailIds);

            const sheetCreationRes = await createSheetNAssignUser(workSheetName,emailIds);

            res.json({
                done: true,
                sheetID: sheetCreationRes
            })

        } catch (error) {

            res.json({
                done: false
            }) 

        }

    }
}