const Query = require('../models').Query; 
// const queryUpdate = async (queryID, newsID) => {
//     try {
//         let query = await Query.findOne({ where: { id: queryID} });
//         let boolquery = JSON.parse(query.boolquery);
//         let should = boolquery.query.bool.should;
//         should.push({
//             match: { id : newsID }
//         })
//         boolquery.query.bool.should = should;
//         boolquery = JSON.stringify(boolquery);
//         await Query.update({  
//             boolquery
//         }, { 
//             where: { id: queryID }  
//         });

//         return true;
//     } catch (error) {
        
//         console.log(error);
//     }
// }


const queryUpdate = async (queryID, newsID) => {
    try {
        let query = await Query.findOne({ where: { id: queryID} });
        let selectedQuery = query.selectedQuery ? JSON.parse(query.selectedQuery) : [];
        selectedQuery.push({
            match: { id : newsID }
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


module.exports = {
    queryUpdate
}

