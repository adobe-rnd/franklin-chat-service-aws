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
  return !!event.requestContext?.routeKey;
}

export const handler = async (event) => {
  console.trace(JSON.stringify(event, null, 2));
  let res;
  try {
    if (isChatEvent(event)) {
      res = handleChatEvent(event);
    } else if (event.path === '/message') {
      res = handleSlackEvent(event);
    } else if (event.path === '/update') {
      await updateChannelMapping();
      res = {
        body: 'ok',
        statusCode: 200,
      };
    } else {
      res = {
        statusCode: 404,
      };
      console.error(`unhandled event: ${JSON.stringify(event, null, 2)}`);
    }
  } catch (e) {
    console.error(e);
    res = { statusCode: 500, body: 'Internal Server Error' };
  }

  return {
    headers: {
      'Access-Control-Allow-Origin': 'http://localhost:8080',
      'Access-Control-Allow-Headers': '*',
    },
    ...res,
  };
};
