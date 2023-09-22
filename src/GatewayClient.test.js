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

import {
  postToConnection,
  deleteConnection,
} from './GatewayClient.js';

jest.mock('@aws-sdk/client-apigatewaymanagementapi', () => {
  process.env.API_GATEWAY_URL = 'https://example.com';
  const originalModule = jest.requireActual('@aws-sdk/client-apigatewaymanagementapi');
  return {
    __esModule: true,
    ...originalModule,
    // eslint-disable-next-line func-names
    ApiGatewayManagementApiClient: jest.fn().mockImplementation(function () {
      this.send = jest.fn();
    }),
    PostToConnectionCommand: jest.fn(),
    DeleteConnectionCommand: jest.fn(),
  };
});

const mockGatewayClient = ApiGatewayManagementApiClient.mock.instances[0];

describe('GatewayClient', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('gets created with the correct endpoint', () => {
    expect(ApiGatewayManagementApiClient).toHaveBeenCalledWith({
      endpoint: process.env.API_GATEWAY_URL,
    });
  });

  describe('postToConnection', () => {
    it('sends the correct data', async () => {
      const testConnectionId = 'testConnectionId';
      const testData = { message: 'test' };

      await postToConnection(testConnectionId, testData);

      expect(PostToConnectionCommand).toHaveBeenCalledWith({
        Data: JSON.stringify(testData),
        ConnectionId: testConnectionId,
      });
      expect(mockGatewayClient.send).toHaveBeenCalledWith(expect.any(PostToConnectionCommand));
    });
  });

  describe('deleteConnection', () => {
    it('sends the correct data', async () => {
      const testConnectionId = 'testConnectionId';

      await deleteConnection(testConnectionId);

      expect(DeleteConnectionCommand).toHaveBeenCalledWith({
        ConnectionId: testConnectionId,
      });
      expect(mockGatewayClient.send).toHaveBeenCalledWith(expect.any(DeleteConnectionCommand));
    });
  });
});
