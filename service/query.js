const Query = require('../models').Query; 

const queryUpdate = async (queryID, newsID) => {
    try {
        let query = await Query.findOne({ where: { id: queryID} });
        let selectedQuery = query.selectedQuery ? JSON.parse(query.selectedQuery) : [];
        selectedQuery.push({
            match_phrase: { id : newsID }
        });
        selectedQuery = JSON.stringify(selectedQuery);
        await Query.update({  
            selectedQuery
        }, { 
            where: { id: queryID }  
        });

        return true;
    } catch (error) {
        
        console.log(error);
    }
}

const assignQueryUpdate = async (queryID, newsID) => {
    try {
        let query = await Query.findOne({ where: { id: queryID} });
        let selectedQuery = query.selectedQuery ? JSON.parse(query.selectedQuery) : [];
        selectedQuery.push({
            match_phrase: { id : newsID }
        });
        selectedQuery = JSON.stringify(selectedQuery);
        await Query.update({  
            selectedQuery
        }, { 
            where: { id: queryID }  
        });

        return true;
    } catch (error) {
        
        console.log(error);
    }
}



const findQuery =  (queryID) =>  new Promise(async (resolve, reject) => {
    try {
        let query = await Query.findOne({ where: { id: queryID} });
        if( query.selectedQuery ){
            let selectedQuery = JSON.parse(query.selectedQuery);
            resolve(selectedQuery);
        }else{
            resolve([]); 
        }
    } catch (error) {
        reject(null);
    }
});


module.exports = {
    queryUpdate,
    findQuery,
    assignQueryUpdate
}

