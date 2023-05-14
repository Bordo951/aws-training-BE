const AWS = require('aws-sdk');
const s3 = new AWS.S3({region: 'us-east-1'});

module.exports.importProductsFile = async (event) => {
    const bucket = 'import-service-uploaded-csv';
    const catalogPath = 'uploaded';
    const { name: fileName } = event.queryStringParameters;
    const key = `${catalogPath}/${fileName}`;

    try {
        const params = {
            Bucket: bucket,
            Key: key,
            ContentType: 'text/csv',
            Expires: 120
        };

        const signedUrl = await s3.getSignedUrlPromise('putObject', params);

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*'
            },
            body: JSON.stringify(signedUrl)
        };
    } catch (error) {
        console.error(error);

        return {
            statusCode: 500,
            body: JSON.stringify({ message: error.message })
        };
    }
};