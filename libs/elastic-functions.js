const { Client } = require('@elastic/elasticsearch')
const config  = require('../config/elastic');
const ElasticClient = new Client({
    node: config.host,
    auth: {
      username: config.user,
      password: config.password
    }
  });

module.exports = {
    getFromElastic: async (index, projectId) => {
      return new Promise((resolve, reject) => {
          ElasticClient.search({
            index: index,
            type: '_doc',
            body: {
              query: {
                match: {
                  projectId: projectId
                }
              }
            }
          }, function (err, data) {
            if (err) resolve({ hits: [] })
            else resolve(data.body.hits);
          })
      })
    },
    getNewsElastic: async (index, projectId, bussinessId) => {
      return new Promise((resolve, reject) => {
          ElasticClient.search({
            index: index,
            type: '_doc',
            body: {
                query:{
                    bool:{
                        must:[
                            { match :{ projectId } },
                            { match :{ bussinessId } }
                        ]
                    }
                },
                sort: { createdAt: { order: "desc" } },
                size: 100
            }
          }, function (err, data) {
            if (err) resolve({ hits: [] })
            else resolve(data.body.hits);
          })
      })
    },
    pushToElastic: async (index, id, data) => {
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
    checkLinkExist: async (index, url) => {
      console.log('url',url);
      let urlMeta = new URL(url);
      let hostname = urlMeta.hostname;
      if(hostname.includes('www')){
          hostname = hostname.replace('www.', '')
      } 
      
      let url_1 = 'https://www.'+ hostname + urlMeta.pathname;
      let url_2 = 'https://www.' + hostname + urlMeta.pathname + urlMeta.search;
  
      let url_3 = 'https://'+ hostname + urlMeta.pathname;
      let url_4 = 'https://' + hostname + urlMeta.pathname + urlMeta.search;
  
      let url_5 = 'http://www.'+ hostname + urlMeta.pathname;
      let url_6 = 'http://www.' + hostname + urlMeta.pathname + urlMeta.search;
  
      let url_7 = 'http://'+ hostname + urlMeta.pathname;
      let url_8 = 'http://' + hostname + urlMeta.pathname + urlMeta.search;

      try {
        let results =  await ElasticClient.search({
            index: index ,
            type: '_doc',
            body: {
                query: {
                  bool: {
                    should: [
                        {match: { url: url_1 }},
                        {match: { id: url_2 }},
                        {match: { url: url_3 }},
                        {match: { id: url_4 }},
                        {match: { url: url_5 }},
                        {match: { id: url_6 }},
                        {match: { url: url_7 }},
                        {match: { id: url_8 }},
                    ],
                    minimum_should_match: 1
                  }
                }
            }
          })
        return  results.hits.total ? true : false;
      } catch (error) {
        console.log(error);
      }
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
    }
}