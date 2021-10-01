const axios = require('axios');
const DATE_MICROSERVICE = "http://localhost:8989/";

const date_service = async (date_string) => {
    const date = await axios.post(DATE_MICROSERVICE, {
        "datestring": date_string
    });
    return date.data
} 

module.exports = date_service;