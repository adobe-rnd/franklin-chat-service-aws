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
import { fetchChannelMapping, getChannelMapping, setChannelMapping } from './ChannelMapping.js';
import { getEmailByToken } from './MagicLinkClient.js';
import { deleteConnection } from './GatewayClient.js';
import {
  deleteItem, getItem, putItem,
} from './DocumentClient.js';
import {
  getChannelInfo, getHistory, getReplies, postToAdminChannel, postToChannel,
} from './SlackClient.js';

export const { DB_CONNECTIONS_TABLE_NAME } = process.env;

function getEmailDomain(email) {
  return email.split('@')[1];
}

async function getChannels() {
  console.debug('getting channels...');
  let channels = await getChannelMapping();
  if (channels.length === 0) {
    console.debug('no channel mapping found, fetching from Google Sheet...');
    channels = await fetchChannelMapping();
    await setChannelMapping(channels);
  }
  return new Map(channels.map(({ domain, channelId }) => [domain, channelId]));
}

async function handleNewConnection(connectionId, token) {
  console.debug(`handling new connection: ${connectionId}`);

  if (!token) {
    console.error('Token not found');
    return {
      statusCode: 401,
    };
  }

  console.debug(`verifying token: ${token}`);
  const email = await getEmailByToken(token);
  console.debug(`email: ${email}`);
  if (!email) {
    console.error('No email found');
    return {
      statusCode: 401,
    };
  }

  console.debug('storing connection details...');
  await putItem(DB_CONNECTIONS_TABLE_NAME, {
    connectionId,
    email,
  });

  return {
    statusCode: 200,
  };
}

async function handleDisconnect(connectionId) {
  console.log(`disconnect: ${connectionId}`);

  console.debug('getting email by connection id...');
  const { Item: { email } } = await getItem(DB_CONNECTIONS_TABLE_NAME, {
    connectionId,
  });

  console.debug('delete connection details...');
  await deleteItem(DB_CONNECTIONS_TABLE_NAME, {
    connectionId,
  });

  console.debug('posting to admin channel...');
  await postToAdminChannel(`User ${email} disconnected`);

  return {
    statusCode: 200,
  };
}

async function handleJoinMessage(message, context) {
  const { connectionId, email } = context;

  const domain = getEmailDomain(email);
  const channels = await getChannels();

  console.debug(`getting channel by domain: ${domain}`);
  const channel = channels.get(domain);
  if (!channel) {
    console.error(`no channel mapping found for ${email}`);
    await postToAdminChannel(`No channel mapping found for ${email}`);

    console.debug('disconnecting client');
    await deleteConnection(connectionId);

    throw new Error('No channel mapping found');
  }

  console.debug('storing connection details...');
  await putItem(DB_CONNECTIONS_TABLE_NAME, {
    connectionId,
    channelId: channel,
    email,
  });

  console.debug('getting channel info...');
  const { teamId, channelName } = await getChannelInfo(channel);

  console.debug('posting to admin channel...');
  await postToAdminChannel(`User ${email} joined channel <a href="#${channelName}">#${channelName}</a>`);

  return {
    email,
    channelId: channel,
    channelName,
    teamId,
  };
}

async function handlePostMessage({ threadId, text, user: { name, icon } }, { channelId }) {
  console.debug('handling post message...');
  return postToChannel(channelId, {
    thread_ts: threadId,
    text,
    username: name,
    icon_url: icon,
  });
}

async function handleHistoryMessage({ latest }, { channelId }) {
  console.debug(`getting history for channel ${channelId} since ${latest}`);
  return getHistory(channelId, latest);
}

async function handleRepliesMessage({ ts }, { channelId }) {
  console.debug(`getting replies for channel ${channelId} and thread ${ts}`);
  return getReplies(ts, channelId);
}

async function processMessage(type, data, context) {
  switch (type) {
    case 'join':
      return handleJoinMessage(data, context);
    case 'post':
      return handlePostMessage(data, context);
    case 'history':
      return handleHistoryMessage(data, context);
    case 'replies':
      return handleRepliesMessage(data, context);
    default:
      throw new Error(`Unknown message type: ${type}`);
  }
}

async function handleMessage(event) {
  const message = JSON.parse(event.body);
  console.debug(`handling message: ${message.type}`);

  console.debug('getting connection details...');
  const { Item: context } = await getItem(
    DB_CONNECTIONS_TABLE_NAME,
    { connectionId: event.requestContext.connectionId },
  );

  try {
    console.debug('processing message...');
    return {
      body: JSON.stringify({
        data: await processMessage(message.type, message.data, context),
        correlationId: message.correlationId,
      }),
      statusCode: 200,
    };
  } catch (e) {
    console.error('error while processing message', e);
    return {
      body: JSON.stringify({
        error: e.message,
        correlationId: message.correlationId,
      }),
      statusCode: 200,
    };
  }
}

export async function handleChatEvent(event) {
  console.debug(`handling route: ${event.requestContext.routeKey}`);
  if (event.requestContext.routeKey === '$connect') {
    return handleNewConnection(
      event.requestContext.connectionId,
      event.queryStringParameters.token,
    );
  } else if (event.requestContext.routeKey === '$disconnect') {
    return handleDisconnect(event.requestContext.connectionId);
  }
  return handleMessage(event);
}
