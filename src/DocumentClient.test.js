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
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';

import {
  getItem,
  getAllItems,
  putItem,
  deleteItem,
} from './DocumentClient.js';

jest.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: jest.fn().mockReturnValue({
      send: jest.fn(),
    }),
  },
  GetCommand: jest.fn(),
  PutCommand: jest.fn(),
  ScanCommand: jest.fn(),
  DeleteCommand: jest.fn(),
}));

const mockDocumentClient = DynamoDBDocumentClient.from();

describe('DynamoDB', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getItem', () => {
    it('retrieves an item', async () => {
      const testTableName = 'TestTable';
      const testKey = { id: 'testId' };

      await getItem(testTableName, testKey);

      expect(GetCommand).toHaveBeenCalledWith({
        TableName: testTableName,
        Key: testKey,
      });
      expect(mockDocumentClient.send).toHaveBeenCalledWith(expect.any(GetCommand));
    });
  });

  describe('getAllItems', () => {
    it('retrieves all items', async () => {
      const testTableName = 'TestTable';

      await getAllItems(testTableName);

      expect(ScanCommand).toHaveBeenCalledWith({
        TableName: testTableName,
      });
      expect(mockDocumentClient.send).toHaveBeenCalledWith(expect.any(ScanCommand));
    });
  });

  describe('putItem', () => {
    it('adds an item', async () => {
      const testTableName = 'TestTable';
      const testItem = { id: 'testId', data: 'testData' };

      await putItem(testTableName, testItem);

      expect(PutCommand).toHaveBeenCalledWith({
        TableName: testTableName,
        Item: testItem,
      });
      expect(mockDocumentClient.send).toHaveBeenCalledWith(expect.any(PutCommand));
    });
  });

  describe('deleteItem', () => {
    it('deletes an item', async () => {
      const testTableName = 'TestTable';
      const testKey = { id: 'testId' };

      await deleteItem(testTableName, testKey);

      expect(DeleteCommand).toHaveBeenCalledWith({
        TableName: testTableName,
        Key: testKey,
      });
      expect(mockDocumentClient.send).toHaveBeenCalledWith(expect.any(DeleteCommand));
    });
  });
});
