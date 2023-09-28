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

export const { CHANNEL_MAPPING_URL, DB_CHANNELS_TABLE_NAME } = process.env;

/*
  * Reads the channel mapping from the Google Sheet.
 */
export async function fetchChannelMapping() {
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

  console.warn('No channels fetched');
  return [];
}

/*
  * Writes the channel mapping to the DynamoDB table.
 */
export async function setChannelMapping(newRules) {
  console.debug('deleting all channel mappings...');
  const existingRules = await getAllItems(DB_CHANNELS_TABLE_NAME);
  await Promise.all(existingRules.Items.map(({ domain }) => {
    return deleteItem(DB_CHANNELS_TABLE_NAME, { domain });
  }));

  console.debug('writing channel mappings...');
  await Promise.all(newRules.map(({ domain, channelId }) => putItem(DB_CHANNELS_TABLE_NAME, {
    domain,
    channelId,
  })));
}

/*
  * Reads the channel mapping from the DynamoDB table.
 */
export async function getChannelMapping() {
  const rules = await getAllItems(DB_CHANNELS_TABLE_NAME);
  return rules.Items.map(({ domain, channelId }) => ({ domain, channelId }));
}
