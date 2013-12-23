/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path');

module.exports = {
  hostname: {
    format: String,
    default: undefined
  },
  port: {
    format: "port",
    default: 443,
    env: "PORT"
  },
  ssl: {
    format: Boolean,
    default: false
  },
  spdy: {
    format: Boolean,
    default: false
  },
  env: {
    doc: "What environment are we running in?  Note: all hosted environments are 'production'.  ",
    format: ["production", "development"],
    default: "production",
    env: 'NODE_ENV'
  },
  views_dir: path.join(__dirname, '..', 'views'),
  config_dir: path.join(__dirname, '..', 'etc'),
  var_dir: path.join(__dirname, '..', 'var'),
  ssl_cert_dir: path.join(__dirname, '..', '..', '..', 'ssl')
};

