const { addSocialMediaArticle } = require('../libs/webhose.data-engine')
const { defaultData } = require('../libs/dataset/web');
const { pushToElastic } = require('../libs/elastic-functions');
const Query = require('../models').Query; 
const { v4: uuidv4 } = require('uuid');
const { queryUpdate } = require('../service/query');
const ES_LINKLIST_INDEX = 'linklist';

module.exports = {

    addArticle: async (req, res) => {
        try {
            const data = req.body;
            const projectId = data.projectId;
            const bussinessId = data.bussinessId;
            const id = uuidv4();
            const urlMeta =  new URL(data.url);
            const host = urlMeta.host;
            let metaData = {
                ...defaultData,
                thread: {
                    ...defaultData.thread,
                    uuid: id,
                    site: host,
                    site_full: host,
                    site_section: host,
                    url: data.url,
                    site_type: data.post_type.value,
                    section_title: data.title,
                    title: data.title,
                    title_full: data.title,
                    published: data.postDate
                },
                text: data.post,
                uuid: id,
                published: data.postDate,
                title: data.title,
                url: data.url,
                author: host,
                crawled: data.postDate,
                updated: data.postDate,
                like_count: data.likes,
                comment_count: data.comment_count
            };

            const responseID =  await addSocialMediaArticle({
                media : 'web',
                data : metaData
            });

            queryUpdate(projectId, responseID);
            
            res.json({
                done : true,
                id: responseID
            });

        } catch (error) {
            res.json({
                done : false
            })
        }
    }
}

