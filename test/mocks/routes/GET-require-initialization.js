/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// A route that needs to be initialized by running the function.

module.exports = function () {
  return {
    path: '/requires_initialization',
    verb: 'get',
    template: 'template',

    authorization: function () {
      return true;
    },

    handler: function() {
      return {};
    },
  };
};

