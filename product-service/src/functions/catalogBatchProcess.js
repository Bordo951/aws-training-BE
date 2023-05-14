const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const INVALID_DATA_ERROR = 'Product data is not valid!';
const INTERNAL_SERVER_ERROR = 'Internal server error!'

const dynamo = new AWS.DynamoDB.DocumentClient();

const validateInputData = (params) => {
    if (typeof params.title !== 'string' || typeof params.description !== 'string' || isNaN(+params.count) || isNaN(+params.price)) {
        throw Error(INVALID_DATA_ERROR);
    }
}

module.exports.catalogBatchProcess = async (event, context, callback) => {
    const sns = new AWS.SNS({ region: 'us-east-1' });

    for (const record of event.Records) {
        const { body: product } = record;
        const inputDataParams = { title, description, price, count } = JSON.parse(product);
        const productId = uuidv4();

        console.log(`createProduct: create product item with id=${productId}, title=${title}, description=${description}, price=${price}`);
        console.log(`createProduct: create stock item with product_id=${productId}, count=${count}`);

        try {

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
                                count: +count,
                            },
                        },
                    },
                ],
            }).promise();

            sns.publish({
                Subject: 'AWS Information message',
                Message: product,
                TopicArn: process.env.SNS_ARN,
            }, (error, data) => {
                console.log('SNS data: ', data);

                if (error) {
                    console.log('Error: ', error);
                }
            });

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
    }

    const response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers" : "*",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
        },
    };

    callback(null, response);
};