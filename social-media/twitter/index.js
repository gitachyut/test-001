var Twit = require('twit')


const T = new Twit({
  consumer_key: 'I9uNT0aE5wUGJkXMBUQBuk1ym',
  consumer_secret: '45jU9QDcy6vicMR44ekwxwn6cl1EEztRKTqzwHBdAKoHoIulWB',
  access_token: '2823687212-YBQvU4wJ3h2IQtcjNI04ldAEzWGggQNB045qinp',
  access_token_secret: 'hAEk8U3OcxStmpTsJ2pjoVLLiWNae6MSpByLRPYXmsgr0',
});

// T.get('statuses/show/1369328754598744067', { tweet_mode: 'extended'},  function(err, data, response) {
//     console.log(JSON.stringify( data ))
//   })
   

T.get('statuses/user_timeline', { tweet_mode: 'extended', count:100, screen_name: 'temasek'},  function(err, data, response) {
    console.log( data )
  })
   