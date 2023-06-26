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
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
  DeleteConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi';

const { API_GATEWAY_URL } = process.env;
console.debug(`API Gateway URL: ${API_GATEWAY_URL}`);

const gatewayClient = new ApiGatewayManagementApiClient({
  endpoint: API_GATEWAY_URL,
});

/*
  * This function is used to send data to a connection.
  * @param {string} connectionId - The connectionId of the connection to send data to.
  * @param {object} data - The data to send to the connection.
  * @returns {Promise} - Returns a promise that resolves with the ApiGatewayManagementApi response.
 */
export async function postToConnection(connectionId, data) {
  const command = new PostToConnectionCommand({
    Data: JSON.stringify(data),
    ConnectionId: connectionId,
  });
  await gatewayClient.send(command);
}

export async function deleteConnection(connectionId) {
  const command = new DeleteConnectionCommand({
    ConnectionId: connectionId,
  });
  await gatewayClient.send(command);
}
