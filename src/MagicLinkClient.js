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
import * as magic from '@magic-sdk/admin';

const { MAGIC_LINK_API_KEY } = process.env;
console.debug(`Magic Link API Key: ${MAGIC_LINK_API_KEY}`);

const { MAGIC_LINK_TEST_MODE } = process.env;
console.debug(`Magic Link Test Mode: ${MAGIC_LINK_TEST_MODE}`);

const magicClient = new magic.Magic(MAGIC_LINK_API_KEY, {
  testMode: MAGIC_LINK_TEST_MODE === 'true',
});

export async function getEmailByToken(token) {
  try {
    console.debug(`getting metadata by token ${token}`);
    const { email } = await magicClient.users.getMetadataByToken(token);
    return email;
  } catch (e) {
    console.error('client connected with invalid token', e);
    return null;
  }
}
