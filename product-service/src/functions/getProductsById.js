const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

const queryProducts = async (id) => {
    const queryResults = await dynamo.query({
        TableName: process.env.PRODUCTS_TABLE,
        KeyConditionExpression: 'id = :id',
        ExpressionAttributeValues: { ':id': id },
    }).promise();
    return queryResults.Items;
};

module.exports.getProductsById = async (event) => {

    try {
        const { productId } = event.pathParameters

        console.log(`Gets product by id=${productId}`);

        const product = await queryProducts(productId);

        if (!product) {
            return {
                statusCode: 404,
                body: JSON.stringify([{
                    statusCode: 404,
                    errorMessage: 'Product not found'
                }])
            }
        }

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify(product)
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({message: error.message})
        };
    }
};
