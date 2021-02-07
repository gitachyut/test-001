const { startDownload, startDownload2 } = require('../reporting/download');
const { 
    pushToElastic, 
    getFromElastic, 
    getNewsElastic,
    checkLinkExist,
    updateDoc
} = require('../libs/elastic-functions'); 
const { createSheetNAssignUser } = require('../reporting/permission');
const { v4: uuidv4 } = require('uuid');
const { errors } = require('@elastic/elasticsearch');
const { findQuery } = require('../service/query');
const { isNull } = require('lodash');
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
            workSheetName: spreadsheetId.label,
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

    exportsAndLink: async (req, res) => {
        const {
            url,
            sheetName,
            spreadsheetId,
            workSheetName,
            existingSheet,
            projectId,
            bussinessId,
            postID,
            postMedia,
            exportLink,
            reload
        } = req.body;

        const sheetMeta = { 
          spreadsheetId: spreadsheetId.value,
          workSheetName:  workSheetName || null,
          existingSheet: existingSheet 
        };
       
        const id = uuidv4();
        let x = {
            id,
            url,
            sheetName,
            spreadsheetId,
            workSheetName: spreadsheetId.label,
            projectId,
            bussinessId
        };

        try {
            startDownload2( url, sheetName, sheetMeta, postID, postMedia, projectId, exportLink, reload )
                    .then(async ( data ) => {
                        pushToElastic(ES_GOOGLE_INDEX, id, x);
                        let docData = {
                            worksheetId: spreadsheetId.value,
                            sheetName: sheetName
                        };
                        await updateDoc(postMedia, postID, docData);
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
                projectId,
                bussinessId
            } = req.body;
            
            if(projectId &&  bussinessId){
                getFromElastic(ES_PROJECTS_SHEETS_INDEX, projectId, bussinessId)
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

    getSheetbyBusiness : async (req, res) => {
        const {
            bussinessId
        } = req.params;

        if(bussinessId){
            getFromElastic(ES_PROJECTS_SHEETS_INDEX, projectId = null, bussinessId)
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
            bussinessId,
            postDate
        } = req.body;

        if(projectId && bussinessId){
            const shoulds = await findQuery(projectId);
            let should_query = [];
            if(shoulds.length > 0){
                shoulds.forEach(should => {
                    should_query.push(should)
                })
                getNewsElastic(should_query, postDate)
                    .then( data => {
                        res.json({
                            data
                        });
                    })
                    .catch( err => {
                        console.log(err);
                        res.status(500).json({ error: 'something is wrong' });
                    })
            }else{
                res.json({
                    data: []
                });
            }

        }

    },
    findUniqueUrl: async (req, res) => {
        try {
            const { url } = req.body;
            if(url){
                const count = await checkLinkExist(url);
                if(count>0){
                    res.json({
                        exist: true
                    })
                }else{
                    res.json({
                        exist: false
                    })
                }
            }else{
                res.json({
                    exist: false
                })
            }
        } catch (error) {
            res.status(500).json({ error: 'something is wrong' });
        }

    }

}