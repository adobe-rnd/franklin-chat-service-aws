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
import { deleteItem, getAllItems, putItem } from './DocumentClient.js';

const { CHANNEL_MAPPING_URL } = process.env;

const CHANNELS_TABLE_NAME = 'chat-channels';

async function fetchChannelMapping() {
  console.debug(`reading channel mapping from url ${CHANNEL_MAPPING_URL}`);

  const response = await fetch(CHANNEL_MAPPING_URL);
  if (!response.ok) {
    console.error('failed to fetch channels mapping');
    throw new Error('failed to fetch channels mapping');
  }

  const json = await response.json();
  const rows = json.data;
  if (rows && rows.length) {
    return rows.map((row) => ({
      domain: row['Email domain'],
      channelId: row['Slack channel ID'],
    }));
  }

  console.warn('No data found.');
  return [];
}

/*
  * Fetches the channel mapping from the Google Sheet and updates the DynamoDB table.
 */
export async function updateChannelMapping() {
  console.debug('fetching channel mapping...');
  const channelMapping = await fetchChannelMapping();

  console.debug('deleting all channel mappings...');
  const rules = await getAllItems(CHANNELS_TABLE_NAME);
  await Promise.all(rules.Items.map(({ domain, channelId }) => {
    return deleteItem(CHANNELS_TABLE_NAME, { domain });
  }));

  console.debug('writing channel mappings...');
  await Promise.all(channelMapping.map(({ domain, channelId }) => putItem(CHANNELS_TABLE_NAME, {
    domain,
    channelId,
  })));
}

/*
  * Returns a map of email domain to Slack channel ID.
 */
export async function getChannelMapping() {
  const rules = await getAllItems(CHANNELS_TABLE_NAME);
  return new Map(rules.Items.map(({ domain, channelId }) => [domain, channelId]));
}
