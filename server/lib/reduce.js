/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const moment = require('moment');
const Stats = require('fast-stats').Stats;

function getPathDateInfo(returnedData, path, date) {
  if ( ! (path in returnedData)) {
    returnedData[path] = [];
    for (var i = 0; i < 30; ++i) {
      returnedData[path][i] = {
        hits: 0,
        date: moment().subtract('days', i).format('YYYY-MM-DD')
      };
    }
  }

  var daysAgo = moment().diff(date, 'days');

  return returnedData[path][daysAgo];
}

function incrementDailyPageHit(returnedData, path, date) {
  var pathDateInfo = getPathDateInfo(returnedData, path, date);
  pathDateInfo.hits++;
}

exports.pageHitsPerDay = function (hitsForHost) {
  var hitsPerDay = {};

  hitsForHost.forEach(function (item) {
    var date = moment(item.createdAt);

    if (item.path)
      incrementDailyPageHit(hitsPerDay, item.path, date);

    incrementDailyPageHit(hitsPerDay, '__all', date);
  });

  return hitsPerDay;
};

exports.pageHitsPerPage = function (hitsForHost) {
  var hitsPerPage = {
    __all: 0
  };

  hitsForHost.forEach(function (item) {
    hitsPerPage.__all++;

    var path = item.path;
    if ( ! path) return;

    if ( ! (path in hitsPerPage)) hitsPerPage[path] = 0;

    hitsPerPage[path]++;
  });

  return hitsPerPage;
};

exports.findLoadTimes = function (hitsForHost) {
  var loadTimes = hitsForHost.map(function (item) {
    var loadTime;
    try {
      var navigationTiming = item.navigationTiming;
      loadTime = navigationTiming.loadEventEnd
                    - navigationTiming.navigationStart;
    } catch(e) {
      return NaN;
    }
    return loadTime;
  });
  return loadTimes;
};

exports.findAverageLoadTime = function (hitsForHost) {
  var count = 0;
  var total = exports.findLoadTimes(hitsForHost).reduce(function (prev, curr) {
    if (isNaN(curr)) return prev;
    count++;
    return prev + curr;
  }, 0);

  if (count) return total / count;
  return 0;
};

exports.findMedianNavigationTimes = function (hitsForHost, done) {
  exports.findNavigationTimingStats(hitsForHost, ['median'], function(err, stats) {
    if (err) return done(err);

    done(null, stats.median);
  });
};

exports.findNavigationTimingStats = function (hitsForHost, statsToFind, options, done) {
  if ( ! done && typeof options === "function") {
    done = options;
    options = {};
  }

  getNavigationTimingStats(hitsForHost, options, function(err, stats) {
    if (err) return done(err);

    var returnedStats = {};
    for (var key in stats) {
      statsToFind.forEach(function(statName) {
        if ( ! (statName in returnedStats)) returnedStats[statName] = {};

        returnedStats[statName][key] = stats[key][statName]();
      });
    }

    done(null, returnedStats);
  });
};

function createStat(options) {
  return new Stats(options);
}

function getNavigationTimingStats (hitsForHost, options, done) {
  // For descriptions, see:
  // https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/NavigationTiming/Overview.html#processing-model

  // prompt for unload
  var navigationStart = createStat(options);

  // redirect
  var redirectStart = createStat(options);
  var redirectEnd = createStat(options);
  var redirectDuration = createStat(options);

  // App cache
  var fetchStart = createStat(options);

  // DNS
  var domainLookupStart = createStat(options);
  var domainLookupEnd = createStat(options);
  var domainLookupDuration = createStat(options);

  // TCP
  var connectStart = createStat(options);
  var secureConnectionStart = createStat(options);
  var connectEnd = createStat(options);
  var connectDuration = createStat(options);

  // request & response timings
  var requestStart = createStat(options);
  var responseStart = createStat(options);
  var responseEnd = createStat(options);
  var requestResponseDuration = createStat(options);

  // processing timings
  var domLoading = createStat(options);
  var domInteractive = createStat(options);
  var domContentLoadedEventStart = createStat(options);
  var domContentLoadedEventEnd = createStat(options);
  var domContentLoadedEventDuration = createStat(options);
  var domComplete = createStat(options);

  // load timings
  var loadEventStart = createStat(options);
  var loadEventEnd = createStat(options);
  var loadEventDuration = createStat(options);

  // calculated when loadEventEnd happens.
  var processingDuration = createStat(options);

  hitsForHost.forEach(function(hit) {
    var navTiming = hit.navigationTiming;

    navigationStart.push(navTiming.navigationStart);

    // redirect
    redirectStart.push(navTiming.redirectStart);
    redirectEnd.push(navTiming.redirectEnd);
    redirectDuration.push(
              navTiming.redirectEnd - navTiming.redirectStart);

    // App cache
    fetchStart.push(navTiming.fetchStart);

    // DNS
    domainLookupStart.push(navTiming.domainLookupStart);
    domainLookupEnd.push(navTiming.domainLookupEnd);
    domainLookupDuration.push(
              navTiming.domainLookupEnd - navTiming.domainLookupStart);

    // TCP
    connectStart.push(navTiming.connectStart);
    secureConnectionStart.push(navTiming.secureConnectionStart);
    connectEnd.push(navTiming.connectEnd);
    connectDuration.push(
              navTiming.connectEnd - navTiming.connectStart);

    requestStart.push(navTiming.requestStart);
    responseStart.push(navTiming.responseStart);
    responseEnd.push(navTiming.responseEnd);
    requestResponseDuration.push(
              navTiming.responseEnd - navTiming.requestStart);

    domLoading.push(navTiming.domLoading);
    domInteractive.push(navTiming.domInteractive);
    domContentLoadedEventStart.push(navTiming.domContentLoadedEventStart);
    domContentLoadedEventEnd.push(navTiming.domContentLoadedEventEnd);
    domContentLoadedEventDuration.push(
              navTiming.domContentLoadedEventEnd - navTiming.domContentLoadedEventStart);
    domComplete.push(navTiming.domComplete);

    loadEventStart.push(navTiming.loadEventStart);
    loadEventEnd.push(navTiming.loadEventEnd);
    loadEventDuration.push(
              navTiming.loadEventEnd - navTiming.loadEventStart);

    processingDuration.push(
              navTiming.loadEventEnd - navTiming.domLoading);
  });

  done(null, {
    navigationStart: navigationStart,

    // redirect
    redirectStart: redirectStart,
    redirectEnd: redirectEnd,
    redirectDuration: redirectDuration,

    // App cache
    fetchStart: fetchStart,

    // DNS
    domainLookupStart: domainLookupStart,
    domainLookupEnd: domainLookupEnd,
    domainLookupDuration: domainLookupDuration,

    // TCP
    connectStart: connectStart,
    secureConnectionStart: secureConnectionStart,
    connectEnd: connectEnd,
    connectDuration: connectDuration,

    // request & response
    requestStart: requestStart,
    responseStart: responseStart,
    responseEnd: responseEnd,
    requestResponseDuration: requestResponseDuration,

    // processing
    domLoading: domLoading,
    domInteractive: domInteractive,
    domContentLoadedEventStart: domContentLoadedEventStart,
    domContentLoadedEventEnd: domContentLoadedEventEnd,
    domContentLoadedEventDuration: domContentLoadedEventDuration,
    domComplete: domComplete,

    // load
    loadEventStart: loadEventStart,
    loadEventEnd: loadEventEnd,
    loadEventDuration: loadEventDuration,
    processingDuration: processingDuration
  });
}
