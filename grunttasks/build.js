/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  'use strict';

  grunt.registerTask('build', [
    'clean',
    'selectconfig:dist',
    'jshint',
    'connect_fonts_copy',
    'connect_fonts',
    'useminPrepare',
    'browserify:dist',
    'sass',
    'autoprefixer',
    'mocha',
    'clean',
    'concat',
    'cssmin',
    'copy',
    'uglify',
    'rev',
    'usemin',
    'zopfli'
  ]);
};

