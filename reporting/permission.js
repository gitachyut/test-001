let { google } = require('googleapis');
let authentication = require("./authentication");
const { createSheet } = require('../reporting/addSheet');
const createSheetNAssignUser = (sheetName, emailIds) => new Promise(async (resolve, reject)=> {
  try {

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

    resolve(sheetId);

  } catch (error) {
    reject(error);
  }

});


module.exports = {
  createSheetNAssignUser
}
