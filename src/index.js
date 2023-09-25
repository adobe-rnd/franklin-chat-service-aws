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
import { handleSlackEvent } from './SlackEventHandler.js';
import { handleChatEvent } from './ChatEventHandler.js';
import { updateChannelMapping } from './ChannelMapping.js';

function isChatEvent(event) {
  return event.requestContext?.eventType === 'MESSAGE'
    || event.requestContext?.eventType === 'CONNECT'
    || event.requestContext?.eventType === 'DISCONNECT';
}

export const handler = async (event) => {
  console.trace(JSON.stringify(event, null, 2));
  try {
    if (isChatEvent(event)) {
      return handleChatEvent(event);
    } else if (event.path === '/message' || event.pathParameters?.path === 'message') {
      return handleSlackEvent(event);
    } else if (event.path === '/update' || event.pathParameters?.path === 'update') {
      await updateChannelMapping();
      return {
        body: 'ok',
        statusCode: 200,
      };
    }

    console.error(`unhandled event: ${JSON.stringify(event, null, 2)}`);
    return {
      statusCode: 404,
    };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: 'Internal Server Error' };
  }
};
