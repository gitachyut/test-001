const Insta = require('scraper-instagram');
const InstaClient = new Insta();

InstaClient.getPost("CIn4KZlFxaX")
	.then(post => console.log(post))
	.catch(err => console.error(err));

InstaClient.getProfile('stcom')
    .then(profile => console.log(profile))
    	.catch(err => console.error(err));
