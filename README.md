# Franklin Chat Service on AWS Lambda
- Slack app:
  - https://api.slack.com/apps/AA4TSRLKV (AEM Engineering)
- Passwordless login: [MagicLink](https://dashboard.magic.link/app?cid=pDpB8lFitWJs6e-dh2Q5EJ3-nqRinvpEFWnh2dO4leU=)
- E-mail to channel mapping: [Google Spreadsheet](https://drive.google.com/drive/u/2/folders/1MlfI4ghY9RdHUYf9xrX_7S_qdBEDEoaC)

## Pre-requisites
- AWS CLI: https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html

## Deploying to AWS lambda
- Add the following properties to `.env`
  ```bash
    SLACK_SIGNING_SECRET=...
    SLACK_BOT_TOKEN=...
    SLACK_ADMIN_CHANNEL=...
    MAGIC_LINK_API_KEY=...
    CHANNEL_MAPPING_URL=...
    API_GATEWAY_URL=...
  ```
- Configure AWS credentials:
  - `aws configure`
- Deploy to AWS lambda:
  - `npm run deploy`


## Troubleshooting
To see the logs of the deployed lambda function:
- `npm run logs`
