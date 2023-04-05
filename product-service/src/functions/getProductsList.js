'use strict';

module.exports.getProductsList = async (event) => {

    const mockData = require('../mockData/data.json');

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify(mockData),
    };
};
