/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const inputValidation = require('../lib/input-validation');
const db = require('../lib/db');
const userCollection = db.user;
const siteCollection = db.site;
const verifier = require('../lib/verifier');

exports.path = '/user';
exports.verb = 'post';
exports.authorization = require('../lib/page-authorization').NOT_AUTHENTICATED;

exports.validation = {
  _csrf: inputValidation.csrf(),
  name: inputValidation.string().min(3).max(50),
  hostname: inputValidation.hostname(),
  assertion: inputValidation.assertion()
};

exports.handler = function (req, res) {
  const name = req.body.name;
  const hostname = req.body.hostname.replace(/^https?:\/\//, '');;
  const assertion = req.body.assertion;

  var email;

  return verifier.verify(assertion)
     .then(function (_email) {
        email = _email;

        // Check if user already exists.
        return userCollection.getOne({
          email: email
        });
      })
     .then(function (existingUser) {
        // just sign the user in.
        if (existingUser) return;

        return userCollection.create({
          name: name,
          email: email
        });
      })
     .then(function () {
        // create site if it does not already exist, throw error otherwise.
        return siteCollection.registerNewSite(hostname, email);
      })
     .then(function () {
        // sign the user in, visit their page.
        req.session.email = email;
        req.session.name = name;
        req.session.hostname = hostname;

        res.redirect('/welcome');
      });
};
