'use babel';

/*global atom*/

/*
 * Copyright (c) 2015-present, Valerii Iatsko
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { Provider } from 'nuclide-quick-open-interfaces';

let providerInstance;
function getProviderInstance() {
  if (providerInstance == null) {
    const GrepProvider = require('./GrepProvider');

    providerInstance = {...GrepProvider};
  }

  return providerInstance;
}

module.exports = {
  registerProvider() {
    return getProviderInstance();
  },
  activate(state) {

  },
  deactivate() {

  }
};
