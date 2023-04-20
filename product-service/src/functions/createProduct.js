const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamo = new AWS.DynamoDB.DocumentClient();

const INVALID_DATA_ERROR = 'Product data is not valid!';
const INTERNAL_SERVER_ERROR = 'Internal server error!'
const SUCCESSFULLY_ADDED_MESSAGE = 'Product has been added successfully!'

/**
 *
 * Checks input data type
 *
 * @param param
 * @param type
 * @returns {boolean}
 */
const isNotValidInputData = (param, type) => {
    return typeof param !== type;
}

/**
 * Validates data
 *
 * @param params
 * @throws Error
 */
const validateInputData = (params) => {
    if (isNotValidInputData(params.title, 'string') ||
        isNotValidInputData(params.description, 'string') ||
        isNotValidInputData(params.price, 'number') ||
        isNotValidInputData(params.count, 'number')
    ) {
        throw Error(INVALID_DATA_ERROR);
    }
}

module.exports.createProduct = async (event, context, callback) => {
    const inputDataParams = {title, description, price, count} = JSON.parse(event.body);
    const productId = uuidv4();

    try {
        console.log(`createProduct: create product item with id=${productId}, title=${title}, description=${description}, price=${price}`);
        console.log(`createProduct: create stock item with product_id=${productId}, count=${count}`);

        validateInputData(inputDataParams);

        await dynamo.transactWrite({
                TransactItems: [
                    {
                        Put: {
                            TableName: process.env.PRODUCTS_TABLE,
                            Item: {
                                id: productId,
                                title,
                                description,
                                price,
                            },
                        },
                    },
                    {
                        Put: {
                            TableName: process.env.STOCKS_TABLE,
                            Item: {
                                product_id: productId,
                                count,
                            },
                        },
                    },
                ],
            }).promise();
        const response = {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*",
            },
            body: JSON.stringify({message: SUCCESSFULLY_ADDED_MESSAGE})
        };

        callback(null, response);
    } catch (error) {
        switch (error.message) {
            case INVALID_DATA_ERROR:
                callback(null, {
                    statusCode: 400,
                    body: JSON.stringify({message: error.message}),
                });
                break;
            default:
                callback(null, {
                    statusCode: 500,
                    body: JSON.stringify({message: INTERNAL_SERVER_ERROR, details: error.message}),
                });
                break;
        }
    }
};