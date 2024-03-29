const { Client } = require('@elastic/elasticsearch')
var request = require('request-promise-native')
const config  = require('../config/elastic');
const ElasticClient = new Client({
    node: config.host,
    auth: {
      username: config.user,
      password: config.password
    }
  });

module.exports = {
    getFromElastic: async (index, projectId, bussinessId) => {
      if(projectId == null){
        return new Promise((resolve, reject) => {
          ElasticClient.search({
            index: index,
            type: '_doc',
            body: {
	      from: 0,
	      size: 100,
              query:{
                  bool:{
                      must:[
                          { match : { bussinessId: bussinessId } }
                      ]
                  }
              }
            }
          }, function (err, data) {
            if (err) resolve({ hits: [] })
            else resolve(data.body.hits);
          })
      })
      }else{
        return new Promise((resolve, reject) => {
            ElasticClient.search({
              index: index,
              type: '_doc',
              body: {
                query:{
                    bool:{
                        must:[
                            { match_phrase : { projectId: projectId } },
                            { match : { bussinessId: bussinessId } }
                        ]
                    }
                }
              }
            }, function (err, data) {
              if (err) resolve({ hits: [] })
              else resolve(data.body.hits);
            })
        })
      }
    },

    getNewsElastic: (shouldQuery, postdate) => {
      const date = postdate.split('T')[0];
      return new Promise( async (resolve, reject) => {
        const completeQuery = {
              "from": 0,
              "size": 100,
              "sort": {
                "post_date": { "order": "desc" }
              },
              "query": {
                  "bool": {
                    "should": [
                      {
                          "bool": {
                              "should": shouldQuery,
                              "minimum_should_match": 1,
                              "filter":[
                                {
                                  "range":{
                                    "createdAt":{
                                      "gte":`${date}T00:00:00.000+0530`,
                                      "lte":`${date}T23:59:59.999+0530`
                                    }
                                  }
                                }
                              ]
                          }
                      }
                    ]
                  }
              }
          };
        
          try {
              var results = await request({
                  method: 'post',
                  json: true,
                  body: completeQuery,
                  url: `${config.credUrl}/${config.ESIndices.join(",")}/_doc/_search`,
                  headers: {
                      'Connection': 'keep-alive',
                      'Content-Type': 'application/json'
                  }
              })
              resolve(results.hits.hits);
          } catch (error) {
            console.log(error)
            reject(error);
          }

      })
    },

    pushToElastic: async (index, id, data) => {
	console.log(JSON.stringify('tre=>>>>>>>>',data))
        return new Promise((resolve, reject) => {
            ElasticClient.index({
                index: index,
                id: id,
                type: '_doc',
                body: data
            }, function (err, data) {
                if (err) reject(err)
                else resolve(data);
            });
        });
    },

    updateComments: async (index, id, data) => {
      return new Promise( async (resolve, reject) => {
        try {

              var bodyDoc = {
                  "doc": {
                    ...data
                  }
              };

              var type = "_update";
              var results = await request({
                  method: 'post',
                  body: bodyDoc,
                  json: true,
                  url: `${config.credUrl}/${index}/${type}/${id}`,
                  headers: {
                      'Connection': 'keep-alive',
                      'Content-Type': 'application/json'
                  }
              })
              resolve(results);
          } catch (error) {
              console.log(error);
              reject(error);
          }
      });
    },

    checkDoc: async (index, id) => {
      return new Promise( async (resolve, reject) => {
        try {
              var type = "_doc";
              var results = await request({
                  method: 'get',
                  json: true,
                  url: `${config.credUrl}/${index}/${type}/${id}`,
                  headers: {
                      'Connection': 'keep-alive',
                      'Content-Type': 'application/json'
                  }
              })

              if(results.found){
                resolve(true);
              }else{
                resolve(false);
              }
              
          } catch (error) {
              resolve(false);
          }
      });
    },

    insertComments: async (index, id, data) => {
      try {
        let doc = await checkDoc(index, id);
        if(doc){
          
        }else{
//          pushToElastic(index, id, data)
        }
      } catch (error) {
        console.error(error);
      }
    },

    checkExist: async (index, id, data) =>{
      try {
        let results =  await ElasticClient.search({
            index: index ,
            type: '_doc',
            body: {
              query: {
                match: {
                    id: id
                }
              }
            }
          })
        return  results.hits.total ? true : false;
      } catch (error) {
        return false;
      }
    },

    checkLinkExist: async (url) => {

      return new Promise( async (resolve, reject) => {

        let urlMeta = new URL(url);
        let hostname = urlMeta.hostname;
        if(hostname.includes('www')){
            hostname = hostname.replace('www.', '')
        } 

        let url_2 = 'https://www.' + hostname + urlMeta.pathname + urlMeta.search;
        let url_4 = 'https://' + hostname + urlMeta.pathname + urlMeta.search;
        let url_6 = 'http://www.' + hostname + urlMeta.pathname + urlMeta.search;
        let url_8 = 'http://' + hostname + urlMeta.pathname + urlMeta.search;

        const completeQuery = {
              "from": 0,
              "size": 100,
              "query": {
                  "bool": {
                    "should": [
                      {
                          "bool": {
                              "should": [
                                {"match_phrase": { "url": url_2 }},
                                {"match_phrase": { "url": url_4 }},
                                {"match_phrase": { "url": url_6 }},
                                {"match_phrase": { "url": url_8 }}
                              ],
                              "minimum_should_match": 1
                          }
                      }
                    ]
                  }
              }
          };
          try {
              var results = await request({
                  method: 'post',
                  json: true,
                  body: completeQuery,
                  url: `${config.credUrl}/${config.ESIndices.join(",")}/_doc/_search`,
                  headers: {
                      'Connection': 'keep-alive',
                      'Content-Type': 'application/json'
                  }
              })
              resolve(results.hits.total.value);
          } catch (error) {
            reject(error);
          }
      })
    },

    update: async (index, id, data) => {
        return new Promise((resolve, reject) => {
            ElasticClient.update({
                index: index,
                id: id,
                type: '_doc',
                body: { doc: data }
            }, function (err, data) {
                if (err) reject(err)
                else resolve(data);
            });
        });
    },

    updateDoc: async (index, id, data) => {
      return new Promise( async (resolve, reject) => {
        try {

              var bodyDoc = {
                "doc": {
                  "commentsLoaded": "true",
                  "commentsMeta": {
                    "worksheetId": data.worksheetId,
                    "sheetName": data.sheetName
                  }
                }
              };

              var type = "_update";
              var results = await request({
                  method: 'post',
                  body: bodyDoc,
                  json: true,
                  url: `${config.credUrl}/${index}/${type}/${id}`,
                  headers: {
                      'Connection': 'keep-alive',
                      'Content-Type': 'application/json'
                  }
              })
              resolve(results);
          } catch (error) {
              console.log(error);
              reject(error);
          }
      });
    },


    updateExportLink: async (index, id, exportLink ) => {
      return new Promise( async (resolve, reject) => {
        try {

              var bodyDoc = {
                "doc": {
                  "exportLink": exportLink
                }
              };

              var type = "_update";
              var results = await request({
                  method: 'post',
                  body: bodyDoc,
                  json: true,
                  url: `${config.credUrl}/${index}/${type}/${id}`,
                  headers: {
                      'Connection': 'keep-alive',
                      'Content-Type': 'application/json'
                  }
              })
              resolve(results);
          } catch (error) {
              console.log(error);
              reject(error);
          }
      });
    },


    deleteDoc: async ({index, type, id}) => {
      return new Promise( async (resolve, reject) => {
        try {
              var results = await request({
                  method: 'delete',
                  json: true,
                  url: `${config.credUrl}/${index}/${type}/${id}`,
                  headers: {
                      'Connection': 'keep-alive',
                      'Content-Type': 'application/json'
                  }
              })
              resolve(results);
          } catch (error) {
              console.log(error);
              reject(error);
          }
      });
    }

}

