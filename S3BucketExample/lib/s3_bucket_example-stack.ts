import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { join } from 'path';
import * as s3 from 'aws-cdk-lib/aws-s3';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class S3BucketExampleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const handler = new Function(this,'new-lambdafor-s3', {
      runtime : Runtime.NODEJS_LATEST,
      timeout: cdk.Duration.seconds(30),
      handler : 'app.handler',
      code: Code.fromAsset(join(__dirname,'../lambdas')),
      environment:{
        REGION_NAME:"ap-south-1",
        THUMBNAIL_SIZE:"128"
      }
    });

    const news3Bucket = new s3.Bucket(this,'image-bucket',{
      removalPolicy : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects : true
    });


    news3Bucket.grantReadWrite(handler); // aws lambda

  }
}
