let { google } = require('googleapis');
const fs = require('fs');
let authentication = require("./authentication");
let sheets = google.sheets('v4');
const { pushToElastic,updateComments, checkDoc } = require('../libs/elastic-functions');
const ES_COMMENTS_INDEX = 'comments';

const importData = (spreadsheetId, range, postID, media, projectId) => new Promise( async (resolve, reject) => {
    const auth =  await authentication.authenticate();
    sheets.spreadsheets.values.get({
        auth: auth,
        spreadsheetId: spreadsheetId,
        range: range,
      }, async (err, res) => {
        if (err) {
            reject(err);
        } else {
            const rows = res.data.values;

            let ifDocExist = await checkDoc(ES_COMMENTS_INDEX, postID);
            let output = null
            if(ifDocExist){
                let postComment = {
                    [projectId]: []
                }
                postComment[projectId] = rows.map(row => {
                    return {
                        sequence: row[0],
                        date: row[1],
                        comment: row[2] || '',
                        sentiment: row[4] || 'Neutral'
                    }
                })
                output = await updateComments(ES_COMMENTS_INDEX, postID, postComment);
            }else{
                let postComment = {
                    id: postID,
                    media: media,
                    [projectId]: []
                }
                postComment[projectId] = rows.map(row => {
                    return {
                        sequence: row[0],
                        date: row[1],
                        comment: row[2] || '',
                        sentiment: row[4] || 'Neutral'
                    }
                })
                output = await pushToElastic(ES_COMMENTS_INDEX, postID, postComment);
            }
            resolve(output);
        }
    });

})
// importData('1NroybZwnvPIQf6ne5B15loX4ufFlKNYYGSFQkm3OHpU', 'Test02!A9:H12', 1213123123112313)

module.exports = {
    importData
}