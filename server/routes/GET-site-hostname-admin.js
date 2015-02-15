/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const site = require('../lib/site');

exports.path = '/site/:hostname/admin';
exports.method = 'get';
exports.template = 'GET-site-hostname-admin.html';
exports.authorization = require('../lib/page-authorization').CAN_ADMIN_HOST;

exports.handler = function(req) {
  var hostname = req.params.hostname;
  var email = req.session.email;

  return site.adminInfo(hostname)
    .then(function (adminInfo) {
      var adminUsers = adminInfo.admin;
      var readonlyUsers = adminInfo.readonly;

      return {
        root_url: req.url.replace(/\?.*/, ''),
        hostname: hostname,
        owner: adminInfo.owner,
        admin_adminInfo: adminUsers,
        readonly_adminInfo: readonlyUsers,
        is_public: adminInfo.is_public,
        isAdmin: true,
        isOwner: adminInfo.owner === email
      };
    });
};
