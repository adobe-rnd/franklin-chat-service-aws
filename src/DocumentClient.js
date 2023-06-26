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
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, ScanCommand, DeleteCommand,
} from '@aws-sdk/lib-dynamodb';

const documentClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

/*
  * This function is used to get a single item from a DynamoDB table.
  * @param {string} tableName - The name of the DynamoDB table.
  * @param {object} key - The key of the item to get.
  * @returns {Promise} - Returns a promise that resolves with the DynamoDB response.
 */
export async function getItem(tableName, key) {
  const command = new GetCommand({
    TableName: tableName,
    Key: key,
  });
  return documentClient.send(command);
}

/*
  * This function is used to get all items from a DynamoDB table.
  * @param {string} tableName - The name of the DynamoDB table.
  * @returns {Promise} - Returns a promise that resolves with the DynamoDB response.
 */
export async function getAllItems(tableName) {
  const command = new ScanCommand({
    TableName: tableName,
  });
  return documentClient.send(command);
}

/*
  * This function is used to get a single item from a DynamoDB table.
  * @param {string} tableName - The name of the DynamoDB table.
  * @param {object} key - The key of the item to get.
  * @returns {Promise} - Returns a promise that resolves with the DynamoDB response.
 */
export async function putItem(tableName, item) {
  const command = new PutCommand({
    TableName: tableName,
    Item: item,
  });
  return documentClient.send(command);
}

/*
  * This function is used to delete a single item from a DynamoDB table.
  * @param {string} tableName - The name of the DynamoDB table.
  * @param {object} key - The key of the item to delete.
  * @returns {Promise} - Returns a promise that resolves with the DynamoDB response.
 */
export async function deleteItem(tableName, key) {
  const command = new DeleteCommand({
    TableName: tableName,
    Key: key,
  });
  return documentClient.send(command);
}
