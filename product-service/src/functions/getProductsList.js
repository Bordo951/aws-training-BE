const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

const scanProducts = async () => {
    const scanResults = await dynamo.scan({
        TableName: process.env.PRODUCTS_TABLE,
    }).promise();

    return scanResults.Items;
};

module.exports.getProductsList = async (event) => {

    try {
        console.log('Gets all products');

        const productItems = await scanProducts();

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify(productItems),
        }

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({message: error.message})
        };
    }
};
