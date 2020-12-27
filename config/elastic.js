let ESIndices = [
  "facebook",
  "twitter",
  "reddit",
  "instagram",
  "youtube",
  "traditional",
  "web"
]

let indexMapping = {
  facebook: ESIndices[0],
  twitter: ESIndices[1],
  reddit: ESIndices[2],
  instagram: ESIndices[3],
  youtube: ESIndices[4],
  traditional: ESIndices[5],
  webhose: ESIndices[6]
}


const config = {
  host: 'https://search.ns-maap.com/elasticsearch/',
  user: 'user',
  password: 'HrgrQrE4s5nz',
  credUrl: 'http://user:HrgrQrE4s5nz@search.ns-maap.com/elasticsearch',
  ESIndices: ESIndices
}

//ALL links
const ES_LINKLIST_INDEX = 'linklist';
//links and shets
const ES_GOOGLE_INDEX = 'googlesheets';
//sheet and project
const ES_PROJECTS_SHEETS_INDEX = 'projectsnsheets';


module.exports = config