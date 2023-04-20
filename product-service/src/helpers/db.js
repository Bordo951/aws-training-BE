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

const queryStocks = async (id) => {
    const queryResults = await dynamo.query({
        TableName: process.env.STOCKS_TABLE,
        KeyConditionExpression: 'product_id = :id',
        ExpressionAttributeValues: { ':id': id },
    }).promise();
    return queryResults.Items;
};

const scanProducts = async () => {
    const scanResults = await dynamo.scan({
        TableName: process.env.PRODUCTS_TABLE,
    }).promise();

    return scanResults.Items;
};

const scanStocks = async () => {
    const scanResults = await dynamo.scan({
        TableName: process.env.STOCKS_TABLE,
    }).promise();

    return scanResults.Items;
};

const mergeProductsAndStocks = (products, stocks) => {
    return products.map((product) => ({
        ...product,
        count: stocks.find(({product_id}) => product_id === product.id)?.count || 0,
    }));
}

export const getProductById = async (productId) => {
    const productsItems = await queryProducts(productId);
    const stocksItems = await queryStocks(productId);

    const products = mergeProductsAndStocks(productsItems, stocksItems);

    return products;
}

export const getProducts = async () => {
    const productItems = await scanProducts();
    const stockItems = await scanStocks();

    return mergeProductsAndStocks(productItems, stockItems);
}

