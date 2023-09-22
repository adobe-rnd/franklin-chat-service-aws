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
import { Magic } from '@magic-sdk/admin';
import { getEmailByToken } from './MagicLinkClient.js';

const USER_EMAIL = 'test@example.com';

jest.mock('@magic-sdk/admin', () => ({
  // eslint-disable-next-line func-names
  Magic: jest.fn().mockImplementation(function () {
    this.users = {
      getMetadataByToken: jest.fn(),
    };
  }),
}));

const magicInstanceMock = Magic.mock.instances[0];

describe('getEmailByToken', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('get created with the correct API key', async () => {
    expect(Magic).toHaveBeenCalledWith(process.env.MAGIC_LINK_API_KEY);
  });

  it('returns the email when the token is valid', async () => {
    const validToken = 'valid-token';
    magicInstanceMock.users.getMetadataByToken.mockResolvedValueOnce({ email: USER_EMAIL });
    const email = await getEmailByToken(validToken);
    expect(email).toBe(USER_EMAIL);
    expect(magicInstanceMock.users.getMetadataByToken).toHaveBeenCalledTimes(1);
    expect(magicInstanceMock.users.getMetadataByToken).toHaveBeenCalledWith(validToken);
  });

  it('returns null in case of an error', async () => {
    const invalidToken = 'invalid-token';
    magicInstanceMock.users.getMetadataByToken.mockRejectedValue(new Error('invalid token'));
    const email = await getEmailByToken(invalidToken);
    expect(email).toBeNull();
    expect(magicInstanceMock.users.getMetadataByToken).toHaveBeenCalledTimes(1);
    expect(magicInstanceMock.users.getMetadataByToken).toHaveBeenCalledWith(invalidToken);
  });
});
