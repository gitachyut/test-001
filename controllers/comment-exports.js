const { startDownload } = require('../reporting/download');
// const { pushToElastic, update, checkExist, checkLinkExist } = require('../libs/elastic-functions');
var request = require('request-promise-native')
const { createSheetNAssignUser } = require('../reporting/permission');
const { v4: uuidv4 } = require('uuid');
const INDEX = 'business';

module.exports = {
    exports: async (req, res) => {

        const {
            url,
            sheetName,
            spreadsheetId,
            workSheetName,
            existingSheet
        } = req.body;
    
        const sheetMeta = { 
          spreadsheetId: spreadsheetId,
          workSheetName:  workSheetName || null,
          existingSheet: existingSheet 
        }
        
        const id = uuidv4();
        startDownload( url, sheetName, sheetMeta )
                .then(async ( data ) => {
                    res.json({
                        done: true
                    }); 
                }) 
                .catch(async err => {
                    console.log('err', err);
                    res.json({
                        fail: true
                    })
                })

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