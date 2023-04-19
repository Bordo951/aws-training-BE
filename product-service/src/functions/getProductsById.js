'use strict';

module.exports.getProductsById = async (event) => {

    const mockData = require('../mockData/data.json');
    const { productId } = event.pathParameters

    const product = await mockData.find((product) => product.id === productId)

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
};
