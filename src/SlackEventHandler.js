/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import { GoneException } from '@aws-sdk/client-apigatewaymanagementapi';
import { deleteItem, getAllItems } from './DocumentClient.js';
import { postToConnection } from './GatewayClient.js';
import { slackToInternalMessage } from './SlackClient.js';
import { CONNECTIONS_TABLE_NAME } from './ChatEventHandler.js';

function isMessage(event) {
  return event.type === 'message' && event.text && (!event.subtype || event.subtype === 'bot_message');
}

export async function handleSlackEvent(event) {
  console.trace(`handling slack event: ${JSON.stringify(event, null, 2)}`);

  const payload = JSON.parse(event.body);
  if (payload.challenge) {
    console.log(`handling challenge: ${payload.challenge}`);
    return {
      statusCode: 200,
      body: JSON.stringify({ challenge: payload.challenge }),
    };
  }

  if (payload.event && isMessage(payload.event)) {
    console.trace(`handling slack message: ${JSON.stringify(payload.event, null, 2)}`);

    const connections = await getAllItems(CONNECTIONS_TABLE_NAME);
    console.debug(`found ${connections.Items.length} connections`);

    const internalMessage = await slackToInternalMessage(payload.event);
    console.debug(`internal message: ${JSON.stringify(internalMessage, null, 2)}`);

    await Promise.all(connections.Items.map(async ({ connectionId, channelId }) => {
      if (channelId !== payload.event.channel) {
        return;
      }
      try {
        console.debug(`sending message to connection: ${connectionId}`);
        await postToConnection(connectionId, {
          type: 'message',
          data: internalMessage,
        });
      } catch (e) {
        if (e instanceof GoneException) {
          console.log(`found stale connection, deleting ${connectionId}`);
          await deleteItem(CONNECTIONS_TABLE_NAME, { connectionId });
        } else {
          console.error(`failed to send message to connection ${connectionId}`, e);
          throw e;
        }
      }
    }));
  }

  return {
    statusCode: 200,
  };
}
