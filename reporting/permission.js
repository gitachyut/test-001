let { google } = require('googleapis');
let authentication = require("./authentication");
const {
  POST_SUMMARY_SHEET,
  ALL_LINKS_SHEET,
  COMMENT_SUMMARY_SHEET
} = require('../config/config');
const { SHEETCOLUMN }  = require('../libs/helper/sheet-column');
const { createSheet, addSheet, appendData } = require('../reporting/addSheet');
const createSheetNAssignUser = (sheetName, emailIds) => new Promise(async (resolve, reject)=> {
  try {
    console.log(sheetName, emailIds);
    const auth = await authentication.authenticate();
    const sheetId = await createSheet(auth, sheetName);
    drive = google.drive({ version: "v3", auth: auth });
    emailIds.push('dev.newssearch@gmail.com');
    emailIds.forEach(async email => {
      const res = await drive.permissions.create({
        resource: {
          type: "user",
          role: "writer",
          emailAddress: email
        },
        fileId: sheetId,
        fields: "id",
      });
    });

    // 1st Sheet
    const allLinksSheet = await addSheet(auth, ALL_LINKS_SHEET, sheetId );
    let allLinksSheetDate = [];
    allLinksSheetDate = [ ["Worksheet Name"],  ["Post Summary"], ["Comment Summary"] ]
    await appendData(auth, ALL_LINKS_SHEET, allLinksSheetDate, sheetId);

    //2nd Sheet
    const postSummarySheet = await addSheet(auth, POST_SUMMARY_SHEET, sheetId );
    let postSummarySheetDate = [];
    postSummarySheetDate.push(SHEETCOLUMN);
    await appendData(auth, POST_SUMMARY_SHEET, postSummarySheetDate, sheetId);

    //3rd Sheet
    await addSheet(auth, COMMENT_SUMMARY_SHEET, sheetId );
    await appendData(auth, COMMENT_SUMMARY_SHEET, allLinksSheetDate, sheetId);
    
    //response
    resolve(sheetId);

  } catch (error) {
    // console.log(error)
    reject(error);
  }

});


module.exports = {
  createSheetNAssignUser
}
