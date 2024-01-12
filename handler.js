const aws= require("aws-sdk");
const {uuid} = require("uuid");

const ses = new aws.SES({region: "ap-south-1"});
const documentClient = new aws.DynamoDB.DocumentClient({region: "ap-south-1"});
const sqs = new aws.SQS({region: "ap-south-1"});


const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

exports.saveCustomer = async(event)=>{

    const CUSTOMER_TABLE_NAME = process.env.CUSTOMER_TABLE_NAME;
    const CUSTOMER_PROCESSING_QUEUE_URL = process.env.CUSTOMER_PROCESSING_QUEUE_URL;

    const {body} = event;
    const {customerType,customer} = JSON.parse(body);
    const id = new Date().getTime().toString();

    const cust = {
        id,
        customer,
        customerItems:customerType,
    };

    console.log("PARAMS:::", cust);

    const putParams ={
        TableName: CUSTOMER_TABLE_NAME,
        Item:cust
    };


    //save ddb
    await documentClient.put(putParams).promise();

    console.log(`Customer ${id}  is been created`);

    // add in the queue which will send and emiakl


    const {MessageId} = await sqs
     .sendMessage({
       QueueUrl :CUSTOMER_PROCESSING_QUEUE_URL,
       MessageBody: JSON.stringify({cust, admin: ADMIN_EMAIL})
        }).promise();

  console.log(`Message ${MessageId}  and ${ADMIN_EMAIL} is been queue`);      
  
  return {
    statusCode: 200,
    body: JSON.stringify({
        cust,
        messageId: MessageId,
    }),
  }
};
 

exports.processCustomer = async (event) => {
    const SOURCE_EMAIL = 'akshayphadkestudent@gmail.com';
  
    console.log("CALLING Process::", event);
  
    const recordPromises = event.Records.map(async (record) => {
      const { body } = record;
      const { cust, admin } = JSON.parse(body);
      const { customer, customerItems } = cust;
      console.log("ADMIN::", admin);
  
      const joinedItems = customerItems.join(", ");
  
      const inquiryMessage = `
          New inquiry received: ${customer}
          Items: ${joinedItems}
      `;
      const sesParams = {
        Message: {
          Body: {
            Text: {
              Data: inquiryMessage,
              Charset: "UTF-8",
            },
          },
          Subject: {
            Data: "New inquiry received",
            Charset: "UTF-8",
          },
        },
        Source: SOURCE_EMAIL,
        Destination: {
          ToAddresses: [admin],
        },
      };
      await ses.sendEmail(sesParams).promise();
    });
    await Promise.all(recordPromises);
  };
  