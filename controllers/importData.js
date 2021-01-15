const { importData } = require('../reporting/importData');
// importData('1NroybZwnvPIQf6ne5B15loX4ufFlKNYYGSFQkm3OHpU', 'Test02!A9:H12', 1213123123112313)
module.exports = {
    pullComments: async (req, res) => {

        let {
            spreadsheetId,
            range,
            id: postId,
            sheetname,
            media
        } = req.body;

        if(spreadsheetId && range && postId ){
            try {
                sheetname = sheetname.trim();
                range = range.trim();
                const RANG = `${sheetname}!${range}`;
                console.log(spreadsheetId, RANG, postId, media)
                await importData(spreadsheetId, RANG, postId, media);
                res.json({
                    done: true,
                    postId: postId
                });
            } catch (error) {
                console.log('error', error)
                res.json({
                    done: false
                });
            }
        }else{
            res.json({
                done: false
            });
        }

    }
}