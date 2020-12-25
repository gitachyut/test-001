const { startDownload } = require('../reporting/download');
const { pushToElastic, getFromElastic, getNewsElastic } = require('../libs/elastic-functions');
var request = require('request-promise-native')
const { createSheetNAssignUser } = require('../reporting/permission');
const { v4: uuidv4 } = require('uuid');
const { errors } = require('@elastic/elasticsearch');
const ES_GOOGLE_INDEX = 'googlesheets';
const ES_PROJECTS_SHEETS_INDEX = 'projectsnsheets';
const ES_LINKLIST_INDEX = 'linklist';

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
          spreadsheetId: spreadsheetId.value,
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
    getSheet: async (req, res) => {
        try {
            const {
                project
            } = req.params;
            
            if(project){
                getFromElastic(ES_PROJECTS_SHEETS_INDEX, project)
                    .then( data => {
                        let response = data.hits.map( hit => {
                            return {
                                workSheetName: hit._source.workSheetName,
                                projectId: hit._source.projectId,
                                sheetID: hit._source.sheetID
                            }
                        });
                        res.json({
                            data: response
                        });
                    })
                    .catch( err => console.log(err))
            }

        } catch (error) {
            res.status(500).json({ error: 'something is wrong' });
        }
    },
    createSheet: async (req, res) => {
        try {
            const {
                workSheetName,
                emails,
                projectId,
                bussinessId
            } = req.body;
            if(workSheetName){
                let emailIds = emails.replace(/^\s+|\s+$/g,"").split(/\s*,\s*/);
                emailIds = emailIds.filter( emailId => emailId !== '' );
                const sheetCreationRes = await createSheetNAssignUser(workSheetName,emailIds);
                const id = uuidv4();
                const _X = {
                    id,
                    sheetID: sheetCreationRes,
                    projectId,
                    bussinessId,
                    workSheetName
                }
                pushToElastic(ES_PROJECTS_SHEETS_INDEX, id, _X);
                res.json({
                    done: true,
                    sheetID: sheetCreationRes
                });
            }else{
                res.json({
                    done: false
                }) 
            }
        } catch (error) {
            res.json({
                done: false
            }) 
        }
    },

    getAllNews: async (req, res) => {
        const {
            projectId,
            bussinessId
        } = req.body;

        if(projectId && bussinessId){
            getNewsElastic(ES_LINKLIST_INDEX, projectId, bussinessId)
                .then( data => {
                    // let response = data.hits.map( hit => {
                    //     return {
                    //         workSheetName: hit._source.workSheetName,
                    //         projectId: hit._source.projectId,
                    //         sheetID: hit._source.sheetID
                    //     }
                    // });
                    res.json({
                        data
                    });
                })
                .catch( err => console.log(err))
        }

    }

}