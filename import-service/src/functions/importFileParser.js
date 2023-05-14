const AWS = require('aws-sdk');
const s3 = new AWS.S3({
    region: 'us-east-1',
    signatureVersion: 'v4',
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
});
const csvToJson = require('csvtojson');

module.exports.importFileParser = async (event) => {

    console.log('Event Records:', event.Records);

    try {
        for (const record of event.Records) {
            const sqs = new AWS.SQS();
            const bucket = 'import-service-uploaded-csv';
            const key = record.s3.object.key;

            console.log(`Processing file: ${key}`);

            const s3Stream = s3.getObject({ Bucket: bucket, Key: key }).createReadStream();
            const products = await csvToJson().fromStream(s3Stream);

            products.forEach(product => {
                sqs.sendMessage({
                    QueueUrl: process.env.SQS_URL,
                    MessageBody: JSON.stringify(product),
                }, (error, data) => {
                    console.log('SQS data: ', data);

                    if (error) {
                        console.log('Error: ', error);
                    }
                });
            });

            console.log(`Sent ${products.length} messages to SQS`);

            const newKey = key.replace('uploaded', 'parsed');

            await s3.copyObject({
                Bucket: bucket,
                CopySource: `${bucket}/${key}`,
                Key: newKey
            }).promise();

            console.log(`Copied file to: ${newKey}`);

            await s3.deleteObject({
                Bucket: bucket,
                Key: key
            }).promise();

            console.log(`Deleted file: ${key}`);
        }

        return  {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*'
            }
        };

    } catch (error) {
        console.error(error);

        throw error;
    }
};