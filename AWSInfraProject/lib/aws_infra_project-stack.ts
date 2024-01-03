import * as cdk from 'aws-cdk-lib';
import { KeyPair } from 'cdk-ec2-key-pair';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { readFileSync } from 'fs';
import { CfnOutput } from 'aws-cdk-lib';


export class AwsInfraProjectStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    // Create a Key pair object here

    const key =  new KeyPair(this,'KeyPair',{
      name:'cdk-ec2-key-pair',
      description: 'Key Pair for CDK deployment'
    });


    //import default VPC

    const vpc = ec2.Vpc.fromLookup(this,'default-vpc',{
      isDefault: true
    });

    //Create a SG for Ec2 instance

    const webSG = new ec2.SecurityGroup(this,'WebCDKSG',{
      vpc,
      allowAllOutbound: true
    });

    webSG.addIngressRule(ec2.Peer.anyIpv4(),
    ec2.Port.tcp(80),
    'Allow Traffic from Anywhere');

    webSG.addIngressRule(ec2.Peer.anyIpv4(),
    ec2.Port.tcp(22),
    'Allow SSH');


    // Create a new EC2 Instance

    const ec2Instance = new ec2.Instance(this,'CDK-webServer-Instance',{
      keyName: key.keyPairName,
      vpc,
      vpcSubnets:{
        subnetType: ec2.SubnetType.PUBLIC
      },
      securityGroup:webSG,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.BURSTABLE2,
        ec2.InstanceSize.MICRO,
      ),
      machineImage: new ec2.AmazonLinuxImage({
        generation : ec2.AmazonLinuxGeneration.AMAZON_LINUX_2
      })
    });

    //load our user Data 

    const userData = readFileSync('./lib/user-data.sh','utf-8');

    //addd user data to EC2 Instance 
    ec2Instance.addUserData(userData);

    // Outputs for Connecting

    new CfnOutput(this,'public dns name',{value: ec2Instance.instancePublicDnsName});
    new CfnOutput(this,'IP address',{value: ec2Instance.instancePublicIp});
    new CfnOutput(this,'Key Pair',{value: key.keyPairName});
    

    new CfnOutput(this,'Download Key Command',{value: 'aws secretsmanager get-secret-value --secret-id ec2-ssh-key/cdk-keypair/private --query SecretString -- output text > cdk-key.pem && chmod 400 cdk-key.pem'})
    new CfnOutput(this,'ssh command',{value: 'ssh -i cdk-key.pem -o IndentitiesOnly=yes ec2-user@' + ec2Instance.instancePublicIp })
  }
}
