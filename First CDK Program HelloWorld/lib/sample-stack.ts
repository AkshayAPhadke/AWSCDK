import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { join } from 'path';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class SampleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const handler = new Function(this , 'Hello-Lambda',{
      runtime : Runtime.NODEJS_LATEST,
      memorySize: 512,
      handler: 'helloworld.handler',
      code: Code.fromAsset(join(__dirname,'../lambdas'))
    })
    
  }
}
