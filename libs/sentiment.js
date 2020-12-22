var Sentiment = require('sentiment');
var sentiment = new Sentiment();

module.exports = {
    calculateSentiment:  (string) => new Promise( async (resolve, reject) =>  {
        let targetString = string;

        var result = sentiment.analyze( targetString );
        let sentimentType = null;
        if(result.score < -2 ){
            sentimentType = "Negative";
        }else if(result.score > 2){
            sentimentType = "Positive";
        }else{
            sentimentType = "Neutral";
        }
        result.sentiment = sentimentType;
        resolve( result );
    })
}
