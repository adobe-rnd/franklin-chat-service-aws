# Franklin Chat Service on AWS Lambda
- Slack app:
  - https://api.slack.com/apps/AA4TSRLKV (AEM Engineering)
- Passwordless login: [MagicLink](https://dashboard.magic.link/app?cid=pDpB8lFitWJs6e-dh2Q5EJ3-nqRinvpEFWnh2dO4leU=)
- E-mail to channel mapping: [Google Spreadsheet](https://drive.google.com/drive/u/2/folders/1MlfI4ghY9RdHUYf9xrX_7S_qdBEDEoaC)
- To update channel mapping click [update](https://7kgloh485m.execute-api.us-east-1.amazonaws.com/development/update)

## Pre-requisites
- AWS CLI: https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html

## Manual deployement to AWS lambda
- Rename `.env-default` file to `.env` and set the values. 
- Configure AWS credentials:
  - `aws configure`
- Deploy to AWS lambda:
  - `npm run deploy`

## CircleCI setup

In the CircleCI settings of the project, there are 2 env variables: `ENV_DEVELOPMENT` and `ENV_PRODUCTION`. They contain the base64 encoded version of the .env file content. To update the value:
- rename `.env-default` file to `.env` and sets the environment variable values
- run `cat .env | base64 | pbcopy`
- delete the environment variable you need to update
- create a new environment variable
- paste into the value field

## AWS resources
- aem-customer-chat-service: lambda function
- aem-customer-chat-service-role-br9mksga: lambda function role
  - AmazonDynamoDBFullAccess: DynamoDB access
  - AmazonAPIGatewayInvokeFullAccess: API Gateway access
- aem-customer-chat-rest: API Gateway REST API
- aem-customer-chat-ws: API Gateway WebSocket API
- aem-customer-chat-connections: DynamoDB table
- aem-customer-chat-channels: DynamoDB table

## Troubleshooting
To see the logs of the deployed lambda function:
- `npm run logs`
