const AWS = require('aws-sdk');
let dynamo = new AWS.DynamoDB.CreateClient();

const MY_TABLE = process.env.MY_TABLE;  // env settings for the dynnamoDB Table 

 exports.handler = async(event,context) =>{
    console.log("Event is Triggered :" , event);

    return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({item : "Hello World !! "}),
    }
}