const got = require("got");
const { createWriteStream, unlinkSync } = require("fs");
const { loadXLS, addNewSheet, loadXLSData, addNewSheet2 } = require('./addSheet');
const { getRedditComments } = require('./reddit');
const { hardwarezoneScraper } = require('./hardwarezone');
const { updateExportLink } = require('../libs/elastic-functions');
const {     
  findCodeFromURL,
  POSTID,
  PROFILEID 
} = require('../utils/getSearchParems');
var path = require('path');
const { 
  initiateCommentsDownloader, 
  checkStatus 
} =  require("./export-comments");
const EXPORT_HOST = 'https://exportcomments.com/exports/';

const fileDownloads = ( remoteFile ) => new Promise((resolve, reject) => {
    let tryCount = 0;
    const downloader = (url, fileName) => {

      const downloadStream = got.stream(url);
      const fileWriterStream = createWriteStream(fileName);
      downloadStream
          .on("downloadProgress", ({ transferred, total, percent }) => {
              const percentage = Math.round(percent * 100);
              console.error(`progress: ${transferred}/${total} (${percentage}%)`);
          })
          .on("error", async (error) => {
              tryCount++;
              if(tryCount > 15){
                unlinkSync(fileName)
                return reject('No comment');
                // throw error
                // throw "No comment";
                // return resolve()
              }else{
                setTimeout(()=>{
                  console.error(`Error: ${error.message}`);
                  console.error(`Try Again....`);
                  downloader(url, fileName);
                }, 2000)
              }
          });
  
      fileWriterStream
          .on("error", (error) => {
              console.log(error)
              unlinkSync(fileName)
              reject('fail to save!');
          })
          .on("finish", () => {
              console.log('Complete Download')
              resolve(`${fileName}`);
          });
  
      downloadStream.pipe(fileWriterStream);

    }

    const url = `${EXPORT_HOST}${remoteFile}`;
    let  fileName = `./downloaded/${remoteFile}`;
    fileName = path.join(__dirname, fileName);
    downloader(url, fileName);
    
}) 


const startDownload =  async (SML, SheetName, sheetMeta ) => new Promise( async (resolve, reject) => {

    try {
      let url = new URL(SML);
      let host = url.hostname;
      let media, response;


      if(host === 'forums.hardwarezone.com.sg' || host === 'www.forums.hardwarezone.com.sg' )
          media = 'hardwarezone';

      if(host === 'facebook.com' || host === 'www.facebook.com' || host === 'm.facebook.com'){
        media = 'facebook';
        if( findCodeFromURL(SML, PROFILEID) && findCodeFromURL(SML, POSTID) ){
          SML =  `https://www.facebook.com/${findCodeFromURL(SML, PROFILEID)}/posts/${findCodeFromURL(SML, POSTID)}`
        }
      }
          

      if(host === 'instagram.com' || host === 'www.instagram.com' )
          media = 'instagram';  

      if(host === 'twitter.com' || host === 'www.twitter.com' )
          media = 'twitter';

      if(host === 'youtube.com' || host === 'www.youtube.com' )
          media = 'youtube';   

      if(host === 'reddit.com' || host === 'www.reddit.com' )
          media = 'reddit';  

        
      if(media === 'facebook' || media === 'instagram' || media === 'twitter' || media === 'youtube' ){
          response = await initiateCommentsDownloader(SML, media);
          const exportLink = response.data.fileName;
          const id = response.data.id;
          setTimeout(async () => {
              const file = await fileDownloads( exportLink );
              loadXLS(file, SheetName, sheetMeta, media)
                .then( r => resolve(r))
                .catch( e => reject(e));
          }, 3000);
      }
      
      if(media === 'reddit'){
          const values = await getRedditComments(SML, sheetMeta.existingSheet);
          addNewSheet(values, SheetName, sheetMeta )
            .then(r => resolve(r))
            .catch(e => reject(e));
      }

      if(media === 'hardwarezone'){
          const values = await hardwarezoneScraper(SML, sheetMeta.existingSheet);
              addNewSheet(values, SheetName, sheetMeta )
                .then(r => resolve(r))
                .catch(e => reject(e));
      }
      
    } catch (error) {
      console.log("error", error);
      reject(error);
    }
}) 


const initiateDownload =  async ( SML ) => new Promise( async (resolve, reject) => {

  try {
    let url = new URL(SML);
    let host = url.hostname;
    let media, response;

    if(host === 'facebook.com' || host === 'www.facebook.com' || host === 'm.facebook.com')
        media = 'facebook';

    if(host === 'instagram.com' || host === 'www.instagram.com' )
        media = 'instagram';  

    if(host === 'twitter.com' || host === 'www.twitter.com' )
        media = 'twitter';

    if(host === 'youtube.com' || host === 'www.youtube.com' )
        media = 'youtube';   

      
    if(media === 'facebook' || media === 'instagram' || media === 'twitter' || media === 'youtube' ){
        response = await initiateCommentsDownloader(SML, media);
        const exportLink = response.data.fileName;  
        resolve(exportLink);
    }else{
      resolve(null);
    }
    
  } catch (error) {
    console.log("error", error);
    reject(error);
  }
}) 



const startDownload2 =  async (SML, SheetName, sheetMeta, postID, postMedia, projectId,  exportedLink=false, reload=false ) => new Promise( async (resolve, reject) => {

  try {
    let url = new URL(SML);
    let host = url.hostname;
    let media, response;


    if(host === 'forums.hardwarezone.com.sg' || host === 'www.forums.hardwarezone.com.sg' )
        media = 'hardwarezone';

    if(host === 'facebook.com' || host === 'www.facebook.com' || host === 'm.facebook.com'){
      // https://www.facebook.com/permalink.php?story_fbid=110487666978284&id=100040511533479
      media = 'facebook';
      if( findCodeFromURL(SML, PROFILEID) && findCodeFromURL(SML, POSTID) ){
        SML =  `https://www.facebook.com/${findCodeFromURL(SML, PROFILEID)}/posts/${findCodeFromURL(SML, POSTID)}`
      }
    }

    if(host === 'instagram.com' || host === 'www.instagram.com' )
        media = 'instagram';  

    if(host === 'twitter.com' || host === 'www.twitter.com' )
        media = 'twitter';

    if(host === 'youtube.com' || host === 'www.youtube.com' )
        media = 'youtube';   

    if(host === 'reddit.com' || host === 'www.reddit.com' )
        media = 'reddit';  

      
    if(media === 'facebook' || media === 'instagram' || media === 'twitter' || media === 'youtube' ){

        if(!exportedLink || reload){
          
          response = await initiateCommentsDownloader(SML, media);
          const exportLink = response.data.fileName;
    //      await updateExportLink(postMedia, postID, exportLink);
          setTimeout(async () => {
              const file = await fileDownloads( exportLink );
              loadXLSData(file, SheetName, sheetMeta, media, postID, postMedia, projectId)
                .then( r => resolve(r))
                .catch( e =>  reject(e));
          }, 3000);

        }else{
          
          const file = await fileDownloads( exportedLink );
          loadXLSData(file, SheetName, sheetMeta, media, postID, postMedia, projectId)
            .then( r => resolve(r))
            .catch( e => reject(e));
        }

    }
    
    if(media === 'reddit'){
        const values = await getRedditComments(SML, sheetMeta.existingSheet, postID, postMedia, projectId);
        addNewSheet2(values, SheetName, sheetMeta )
          .then(r => resolve(r))
          .catch(e => reject(e));
    }

    if(media === 'hardwarezone'){
        const values = await hardwarezoneScraper(SML, sheetMeta.existingSheet, postID, postMedia, projectId);
            addNewSheet2(values, SheetName, sheetMeta )
              .then(r => resolve(r))
              .catch(e => reject(e));
    }
    
  } catch (error) {
    console.log("error", error);
    reject(error);
  }
}) 



module.exports = {
  startDownload,
  startDownload2,
  initiateDownload
}
