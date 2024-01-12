import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
 import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaEventSource from 'aws-cdk-lib/aws-lambda-event-sources';
import {join} from 'path';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Duration } from 'aws-cdk-lib';

export class Project3SesExampleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

 // create sqs

 const createCustomerQueue = new sqs.Queue(this,'CreateCustomerQueue',{
  queueName: 'CreateCustomerQueue',
  visibilityTimeout: cdk.Duration.seconds(45)
 });

 //create an sqs event source

const lambdaSQSEventSource = new lambdaEventSource.SqsEventSource(createCustomerQueue,{
  batchSize: 10,
  enabled: true
});

//create Lambda for processing 

const processCustomers = new lambda.Function(this,'ProcessCustomer',{
  code: lambda.Code.fromAsset(join(__dirname,'../lambdas')),
  handler: 'handler.processCustomer',
  runtime: lambda.Runtime.NODEJS_LATEST
});


//creating and event source to the saveCustomerLambda so that lambda can pool to processCustomers

processCustomers.addEventSource(lambdaSQSEventSource);

processCustomers.addToRolePolicy(new iam.PolicyStatement({
effect: iam.Effect.ALLOW,
actions: ['ses:*'],
resources: ['*'],
sid: 'SendEmailPolicySid',

}));

//DDB Table

const customerTable = new dynamodb.Table(this,'CustomerEnquiryTable',{
  partitionKey:{name:'id',type:dynamodb.AttributeType.STRING},
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
  encryption: dynamodb.TableEncryption.DEFAULT,
  pointInTimeRecovery:false
});


const SaveCustomerLambda= new lambda.Function(this,'SaveCustomerLambda',{
  code: lambda.Code.fromAsset(join(__dirname,'../lambdas')),
  handler: 'handler.saveCustomer',
  runtime: lambda.Runtime.NODEJS_LATEST,
  memorySize: 256,
  timeout: Duration.seconds(10),
  environment: {
    CUSTOMER_TABLE_NAME: customerTable.tableName,
    CUSTOMER_PROCESSING_QUEUE_URL: createCustomerQueue.queueUrl,
    ADMIN_EMAIL:'akshayaphadke@gmail.com'
  }
});

customerTable.grantWriteData(SaveCustomerLambda); 
createCustomerQueue.grantSendMessages(SaveCustomerLambda);


 // creates an API Gateway REST API
const restApi = new apigateway.RestApi(this, 'EmailServiceApi', {
  restApiName: 'EmailService',
});

const newInquiries = restApi.root.addResource('cust')
  .addResource('new');
  // creating a POST method for the new customer resource that integrates with the saveCustomer Lambda function
  newInquiries.addMethod('POST', new apigateway.LambdaIntegration(
    SaveCustomerLambda), {
    authorizationType: apigateway.AuthorizationType.NONE,
  });


  }
}
