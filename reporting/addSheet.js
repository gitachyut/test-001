let { google } = require('googleapis');
const ExcelJS = require('exceljs');
const fs = require('fs');
let authentication = require("./authentication");
const { resolve } = require('path');
let sheets = google.sheets('v4');
const { pushToElastic } = require('../libs/elastic-functions');
const ES_COMMENTS_INDEX = 'comments';


const random = _ =>  Math.floor(100000 + Math.random() * 9000000);

const createSheet = (auth,workSheetName) => new Promise((resolve, reject) => {
    sheets.spreadsheets.create({
      auth: auth,
      resource: {
          properties:{
              title: workSheetName
          }
      }
    }, (err, response) => {
      if (err) {
        reject(err);
      } else {
        resolve(response.data.spreadsheetId);
      }
    });
})

const addSheet = (auth, sheetName, spreadsheetId) =>  new Promise((resolve, reject) => {
    const sheetId = random();
    const request = {
          auth: auth,
          "spreadsheetId": spreadsheetId,
          "resource": {
              "requests": [
                  {
                      "addSheet": {
                          "properties": {
                              "sheetId": sheetId,
                              "title": sheetName,
                              "index": 2,
                              "rightToLeft": false
                          }
                      }
                  }
              ]
          }
      };
  
      sheets.spreadsheets.batchUpdate(request, (err, response) => {
          if (err) {
            console.log('err addSheet => ', err);
            reject(err);
          } else {
            resolve(sheetId);
          }
      });

})

const mergeData =  (auth, sheetName , values, spreadsheetId) => new Promise((resolve, reject) => {
    const resource = {
        values,
      };
      sheets.spreadsheets.values.append({
        auth: auth,
        spreadsheetId: spreadsheetId,
        range: `${sheetName}!A:A`,
        valueInputOption: 'RAW',
        resource,
      }, (err, result) => {
        if (err) {
          // Handle error
          console.log(err)
            reject(err);
        } else {
            resolve(result); 
        }
    });
}) 


const appendData =  (auth, sheetName, values, spreadsheetId) => new Promise((resolve, reject) => {
    const resource = {
        values,
      };
      sheets.spreadsheets.values.update({
        auth: auth,
        spreadsheetId: spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: 'USER_ENTERED',
        resource,
      }, (err, result) => {
        if (err) {
          // Handle error
            console.log('err appendData => ', err)
            reject(err);
        } else {
            resolve(result);
            
        }
    });
}) 


const addNewSheet  = async (values, sheetName, { spreadsheetId, workSheetName, existingSheet }, commentSheetFileLoc = null) => new Promise(async (resolve, reject) => {

            try {
                const auth =  await authentication.authenticate();
                if(!spreadsheetId){
                    spreadsheetId = await createSheet(auth, workSheetName);
                }
                
                let result;

                if(existingSheet === 'false' || existingSheet === '' || !existingSheet ){
                    const sheet = await addSheet(auth, sheetName, spreadsheetId);
                    result = await appendData(auth, sheetName, values, spreadsheetId);
                }
                
                if(existingSheet === 'true'){
                    result = await mergeData(auth, sheetName, values, spreadsheetId);
                }

                if(commentSheetFileLoc)
                    fs.unlinkSync(commentSheetFileLoc);

                resolve(result);
            } catch (error) {
                reject(error)
            }
        }) 

   
const addNewSheet2  = async (values, sheetName, { spreadsheetId, workSheetName, existingSheet }, commentSheetFileLoc = null) => new Promise(async (resolve, reject) => {
    try {
        const auth =  await authentication.authenticate();
        if(!spreadsheetId){
            console.log('==== here inside new ====')
            spreadsheetId = await createSheet(auth, workSheetName);
        }
        
        let result;

        if(existingSheet === 'false' || existingSheet === '' || !existingSheet ){
            const sheet = await addSheet(auth, sheetName, spreadsheetId);
            result = await appendData(auth, sheetName, values, spreadsheetId);
        }
        
        if(existingSheet){
            result = await mergeData(auth, sheetName, values, spreadsheetId);
        }

        if(commentSheetFileLoc)
            fs.unlinkSync(commentSheetFileLoc);

        resolve(result);

    } catch (error) {
        console.log('error', error);
        reject(error);
    }
 }) 
const loadXLS  = async (commentSheetFileLoc, sheetName, sheetMeta, media) => new Promise(async (resolve, reject) => {

    const wb = new ExcelJS.Workbook();
    const excelFile = await wb.xlsx.readFile(commentSheetFileLoc);
    let ws = excelFile.getWorksheet('ExportComments.com');
    let data = ws.getSheetValues();
    data.map(r => {
        return [r[3],r[2],r[3]]
    })
    data.shift();
    data.shift();

    if(media == 'facebook'){
        data = data.map((r,i)=>{
            if(i === 0){
                return [
                    'Post Link',
                    r[2],
                    ''
                ]
            }
            if( i > 1){
                if(r[2]){
                    let t = r[2].replace('-', '.')
                    return [
                        parseFloat(t), r[5], r[7]
                    ]
                }else{
                    if(r[1])
                        return [
                            r[1], r[5], r[7]
                        ]
                }  
            }
        })
    }


    if(media == 'instagram'){
        data = data.map((r,i)=>{
            if(i === 0){
                return [
                    'Post Link',
                    r[2],
                    ''
                ]
            }
            if( i > 1){
                if(r[2]){
                    let t = r[2].replace('-', '.')
                    return [
                        parseFloat(t), r[4], r[6]
                    ]
                }else{
                    if(r[1])
                        return [
                            r[1], r[4], r[6]
                        ]
                }  
            }
        })
    }


    if(media == 'youtube'){
        data = data.map((r,i)=>{
            if(i === 0){
                return [
                    'Post Link',
                    r[2],
                    ''
                ]
            }
            if( i > 1){
                if(r[2]){
                    let t = r[2].replace('-', '.')
                    return [
                        parseFloat(t), r[4], r[8]
                    ]
                }else{
                    if(r[1])
                        return [
                            r[1], r[4], r[8]
                        ]
                }  
            }
        })
    }


    if(media == 'twitter'){
        data = data.map((r,i)=>{
            if(i === 1){
                return [
                    'Post Link',
                    r[2],
                    ''
                ]
            }
            if( i > 1){
                if(r[2]){
                    let t = r[2].replace('-', '.')
                    return [
                        parseFloat(t), r[10], r[11]
                    ]
                }else{
                    if(r[1])
                        return [
                            r[1], r[10], r[11]
                        ]
                }  
            }
        })
    }

    let { existingSheet } = sheetMeta;

    if(existingSheet === 'false' || !existingSheet){
        if(media == 'twitter'){
            data.splice(0, 0, ['Item', 'Hot Link']);
            data.splice(1, 0, ['Post Summary', 'Post Summary']);
            data.splice(2, 0, ['Comment Summary', 'Comment Summary']);
            data.splice(5, 0, ['']);
            data.splice(6, 0, ['']);
            data.splice(7, 0, ['Sequence', 'Date', 'Comment','Relevancy', 'Sentiment']);
        }else{
            data.splice(0, 0, ['Item', 'Hot Link']);
            data.splice(1, 0, ['Post Summary', 'Post Summary']);
            data.splice(2, 0, ['Comment Summary', 'Comment Summary']);
            data.splice(4, 0, ['']);
            data.splice(5, 0, ['']);
            data.splice(6, 0, ['Sequence', 'Date', 'Comment','Relevancy', 'Sentiment']);
        }
    }

    addNewSheet(
        data, 
        sheetName, 
        sheetMeta,
        commentSheetFileLoc
    )
    .then(res => resolve(res))
    .catch(err => reject(err))

}) 



   
const loadXLSData = async (commentSheetFileLoc, sheetName, sheetMeta, media, postID, postMedia) => new Promise(async (resolve, reject) => {

    const wb = new ExcelJS.Workbook();
    const excelFile = await wb.xlsx.readFile(commentSheetFileLoc);
    let ws = excelFile.getWorksheet('ExportComments.com');
    let data = ws.getSheetValues();

    let dataToPushToES = [];
    data.map(r => {
        return [r[3],r[2],r[3]]
    })
    data.shift();
    data.shift();

    if(media == 'facebook'){
        data = data.map((r,i)=>{
            if(i === 0){
                return [
                    'Post Link',
                    r[2],
                    ''
                ]
            }
            if( i > 1){
                if(r[2]){
                    let t = r[2].replace('-', '.')

                    dataToPushToES.push({
                        sequence: parseFloat(t).toString(),
                        date: r[5],
                        comment: r[7] || '',
                        sentiment: 'Neutral'
                    });

                    return [
                        parseFloat(t), r[5], r[7]
                    ]
                }else{
                    if(r[1]){
                        dataToPushToES.push({
                            sequence: r[1].toString(),
                            date: r[5],
                            comment: r[7] || '',
                            sentiment: 'Neutral'
                        });
                        return [
                            r[1], r[5], r[7]
                        ]
                    }
                        
                }  

                
            }
        })
    }


    if(media == 'instagram'){
        data = data.map((r,i)=>{
            if(i === 0){
                return [
                    'Post Link',
                    r[2],
                    ''
                ]
            }
            if( i > 1){
                if(r[2]){
                    let t = r[2].replace('-', '.')

                    dataToPushToES.push({
                        sequence: parseFloat(t).toString(),
                        date: r[4],
                        comment: r[6] || '',
                        sentiment: 'Neutral'
                    });

                    return [
                        parseFloat(t), r[4], r[6]
                    ]
                }else{
                    if(r[1]){

                        dataToPushToES.push({
                            sequence: r[1].toString(),
                            date: r[4],
                            comment: r[6] || '',
                            sentiment: 'Neutral'
                        });

                        return [
                            r[1], r[4], r[6]
                        ]
                    }
                }  
            }
        })
    }


    if(media == 'youtube'){
        data = data.map((r,i)=>{
            if(i === 0){
                return [
                    'Post Link',
                    r[2],
                    ''
                ]
            }
            if( i > 1){
                if(r[2]){
                    let t = r[2].replace('-', '.')

                    dataToPushToES.push({
                        sequence: parseFloat(t).toString(),
                        date: r[4],
                        comment: r[8] || '',
                        sentiment: 'Neutral'
                    });

                    return [
                        parseFloat(t), r[4], r[8]
                    ]
                }else{
                    if(r[1]){

                        dataToPushToES.push({
                            sequence: r[1].toString(),
                            date: r[4],
                            comment: r[8] || '',
                            sentiment: 'Neutral'
                        });
                        return [
                            r[1], r[4], r[8]
                        ]

                    }
                }  
            }
        })
    }


    if(media == 'twitter'){
        data = data.map((r,i)=>{
            if(i === 1){
                return [
                    'Post Link',
                    r[2],
                    ''
                ]
            }
            if( i > 1){
                if(r[2]){
                    let t = r[2].replace('-', '.')

                    dataToPushToES.push({
                        sequence: parseFloat(t).toString(),
                        date: r[10],
                        comment: r[11] || '',
                        sentiment: 'Neutral'
                    });

                    return [
                        parseFloat(t), r[10], r[11]
                    ]
                }else{
                    if(r[1]){

                        dataToPushToES.push({
                            sequence: r[1].toString(),
                            date: r[10],
                            comment: r[11] || '',
                            sentiment: 'Neutral'
                        });

                        return [
                            r[1], r[10], r[11]
                        ]
                    }
                }  
            }
        })
    }

    let { existingSheet } = sheetMeta;

    if(existingSheet === 'false' || !existingSheet){
        if(media == 'twitter'){
            data.splice(0, 0, ['Item', 'Hot Link']);
            data.splice(1, 0, ['Post Summary', 'Post Summary']);
            data.splice(2, 0, ['Comment Summary', 'Comment Summary']);
            data.splice(5, 0, ['']);
            data.splice(6, 0, ['']);
            data.splice(7, 0, ['Sequence', 'Date', 'Comment','Relevancy', 'Sentiment']);
        }else{
            data.splice(0, 0, ['Item', 'Hot Link']);
            data.splice(1, 0, ['Post Summary', 'Post Summary']);
            data.splice(2, 0, ['Comment Summary', 'Comment Summary']);
            data.splice(4, 0, ['']);
            data.splice(5, 0, ['']);
            data.splice(6, 0, ['Sequence', 'Date', 'Comment','Relevancy', 'Sentiment']);
        }
    }

    let postComment = {
        id: postID,
        media: postMedia,
        comments: dataToPushToES
    }
    const output = await pushToElastic(ES_COMMENTS_INDEX, postID, postComment);

    addNewSheet2(
        data, 
        sheetName, 
        sheetMeta,
        commentSheetFileLoc
    )
    .then(res => resolve(res))
    .catch(err => reject(err))

}) 


module.exports = {
    loadXLS,
    loadXLSData,
    addNewSheet,
    addNewSheet2,
    createSheet,
    addSheet,
    appendData,
    mergeData
}