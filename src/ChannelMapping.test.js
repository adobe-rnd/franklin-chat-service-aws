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
import { getAllItems, putItem, deleteItem } from './DocumentClient.js';

import {
  fetchChannelMapping,
  setChannelMapping,
  getChannelMapping,
  CHANNELS_TABLE_NAME,
} from './ChannelMapping.js';

jest.mock('./DocumentClient.js', () => ({
  getAllItems: jest.fn(),
  deleteItem: jest.fn(),
  putItem: jest.fn(),
}));

global.fetch = jest.fn();

describe('ChannalMapping', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchChannelMapping', () => {
    it('returns a correctly mapped array if data is present', async () => {
      const mockResponseData = {
        data: [
          { 'Email domain': 'example.com', 'Slack channel ID': '1234' },
          { 'Email domain': 'test.com', 'Slack channel ID': '5678' },
        ],
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponseData),
      });

      const result = await fetchChannelMapping();

      expect(result).toEqual([
        { domain: 'example.com', channelId: '1234' },
        { domain: 'test.com', channelId: '5678' },
      ]);
    });

    it('returns an empty array if no data is present', async () => {
      const mockResponseData = { data: [] };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponseData),
      });

      const result = await fetchChannelMapping();

      expect(result).toEqual([]);
    });

    it('throws an error if fetch fails', async () => {
      global.fetch.mockResolvedValueOnce({ ok: false });

      await expect(fetchChannelMapping()).rejects.toThrow('failed to fetch channels mapping');
    });
  });

  describe('setChannelMapping', () => {
    it('deletes existing rules and set new ones', async () => {
      const existingRules = [
        { domain: 'oldexample.com', channelId: '1111' },
      ];
      getAllItems.mockResolvedValueOnce({ Items: existingRules });

      const newRules = [
        { domain: 'example.com', channelId: '1234' },
        { domain: 'test.com', channelId: '5678' },
      ];

      await setChannelMapping(newRules);

      // Expect the old rules to be deleted
      expect(deleteItem).toHaveBeenCalledTimes(1);
      expect(deleteItem).toHaveBeenCalledWith(CHANNELS_TABLE_NAME, { domain: 'oldexample.com' });

      // Expect the new rules to be set
      expect(putItem).toHaveBeenCalledTimes(2);
      expect(putItem).toHaveBeenCalledWith(CHANNELS_TABLE_NAME, newRules[0]);
      expect(putItem).toHaveBeenCalledWith(CHANNELS_TABLE_NAME, newRules[1]);
    });

    it('sets new rules only if no existing rules are present', async () => {
      // No existing rules
      getAllItems.mockResolvedValueOnce({ Items: [] });

      // The new rules to set
      const newRules = [
        { domain: 'example.com', channelId: '1234' },
        { domain: 'test.com', channelId: '5678' },
      ];

      await setChannelMapping(newRules);

      // Expect no deletion to occur
      expect(deleteItem).not.toHaveBeenCalled();

      // Expect the new rules to be set
      expect(putItem).toHaveBeenCalledTimes(2);
      expect(putItem).toHaveBeenCalledWith(CHANNELS_TABLE_NAME, newRules[0]);
      expect(putItem).toHaveBeenCalledWith(CHANNELS_TABLE_NAME, newRules[1]);
    });
  });

  describe('getChannelMapping', () => {
    it('returns a map of domain to channelId', async () => {
      const mockItems = [
        { domain: 'example.com', channelId: '1234' },
        { domain: 'test.com', channelId: '5678' },
      ];

      getAllItems.mockResolvedValueOnce({ Items: mockItems });

      const result = await getChannelMapping();

      expect(result.get('example.com')).toBe('1234');
      expect(result.get('test.com')).toBe('5678');
    });

    it('returns an empty map if no items are present', async () => {
      getAllItems.mockResolvedValueOnce({ Items: [] });

      const result = await getChannelMapping();

      expect(result.size).toBe(0);
    });
  });
});
