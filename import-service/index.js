export const handler = async (event) => {
    const { BUCKET_NAME } = process.env;

    console.log(BUCKET_NAME);
    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers" : "*",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
        },
        body: JSON.stringify(
            {
                message:
                    "Go Serverless v3.0! Your function executed successfully!",
                input: event,
            },
            null,
            2
        ),
    };
};