# Franklin Chat Service on AWS Lambda
- Slack app:
  - https://api.slack.com/apps/AA4TSRLKV (AEM Engineering)
  - https://api.slack.com/apps/A056A7R316Z (Adobe Enterprise Support)
- Passwordless login: [MagicLink](https://dashboard.magic.link/app?cid=pDpB8lFitWJs6e-dh2Q5EJ3-nqRinvpEFWnh2dO4leU=)
- E-mail to channel mapping: [Google Spreadsheet](https://drive.google.com/drive/u/2/folders/1MlfI4ghY9RdHUYf9xrX_7S_qdBEDEoaC)

## Pre-requisites
- AWS CLI: https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html

## Required .env values

```
SLACK_SIGNING_SECRET=<Slack bot signing secret>
SLACK_BOT_TOKEN=<Slack bot token>

SLACK_ADMIN_CHANNEL=<Slack admin channel ID>

MAGIC_LINK_API_KEY=<Magic.Link API secret key>

CHANNEL_MAPPING_URL=<JSON URL to channel mapping sheet>
API_GATEWAY_URL=<URL to the API Gateway (HTTPS connection to WS API)>

DB_CHANNELS_TABLE_NAME=<DynamoDB table name: channels mapping>
DB_CONNECTIONS_TABLE_NAME=<DynamoDB table name: list of connections>
```
## Manual deployement to AWS lambda

- Create a `.env` file with the following variables and their values (see above)
- Configure AWS credentials:
  - `aws configure`
- Deploy to AWS lambda:
  - `npm run deploy`

## CircleCI setup

In the CircleCI settings of the project, there are 2 env variables: `ENV_DEVELOPMENT` and `ENV_PRODUCTION`. They contain the base64 encoded version of the .env file content. To update the value:
- Create a `.env` file with the following variables and their values: (see above)
- Run `cat .env | base64 | pbcopy`
- Delete the environment variable you need to update
- Create a new environment variable
- Paste into the value field

## AWS resources
- aem-customer-chat-service: lambda function
- aem-customer-chat-service-role-br9mksga: lambda function role
  - AmazonDynamoDBFullAccess: DynamoDB access
  - AmazonAPIGatewayInvokeFullAccess: API Gateway access
- API Managed by Helix Deploy: API Gateway REST API
- aem-customer-chat-ws: API Gateway WebSocket API
- process.env.DB_CONNECTIONS_TABLE_NAME: DynamoDB table
- process.env.DB_CHANNELS_TABLE_NAME: DynamoDB table

## Troubleshooting
To see the logs of the deployed lambda function:
- `npm run logs`
