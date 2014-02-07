/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*global RD, DOMinator */
(function() {
  window.addEventListener('load', function() {

    hitsGraph();
    navigationTimingGraph();
    histogramGraph();
    cdfGraph();

  }, false);

  function hitsGraph() {
    // Get data from the HTML
    var dayEls = [].slice.call(document.querySelectorAll('.hits-data-day'), 0);
    if (! dayEls.length) return;

    var data = dayEls.map(function(dayEl) {
      var dateEl = dayEl.querySelector('.hits-data-date');
      var hitsEl = dayEl.querySelector('.hits-data-hits');

      return {
        date: dateEl.textContent,
        hits: parseInt(hitsEl.textContent, 10)
      };
    });

    // Graph the data!
    RD.Graphs.Hits({
      __all: data
    });

    document.getElementById('hits-data').style.display = 'none';

  }

  function navigationTimingGraph() {
    var navigationTimingEls = [].slice.call(document.querySelectorAll('.navigation-timing-row'));
    if (! navigationTimingEls.length) return;

    var navigationTiming1QData = {};
    var navigationTiming2QData = {};
    var navigationTiming3QData = {};
    navigationTimingEls.forEach(function(navigationTimingEl) {
      var keyEl = navigationTimingEl.querySelector('.navigation-timing-key');

      var valueEl = navigationTimingEl.querySelector('.navigation-timing-first_q_value');
      navigationTiming1QData[keyEl.textContent] = parseInt(valueEl.textContent, 10);

      valueEl = navigationTimingEl.querySelector('.navigation-timing-second_q_value');
      navigationTiming2QData[keyEl.textContent] = parseInt(valueEl.textContent, 10);

      valueEl = navigationTimingEl.querySelector('.navigation-timing-third_q_value');
      navigationTiming3QData[keyEl.textContent] = parseInt(valueEl.textContent, 10);
    });

    var graph = RD.Graphs.NavigationTiming.create();
    graph.init({
      root: '#navigation-timing-graph',
      data: [
        navigationTiming1QData,
        navigationTiming2QData,
        navigationTiming3QData
      ],
      width: DOMinator('#navigation-timing-graph').nth(0).clientWidth,
      height: '250'
    });
    graph.render();


    document.getElementById('medians').style.display = 'none';
  }

  function histogramGraph() {
    var histogramDataEls = DOMinator('#histogram-data li');
    if (! histogramDataEls.length) return;
    var histogramData = [];

    var min, max;

    histogramDataEls.forEach(function(el) {
      var text = DOMinator(el).inner().trim();
      if (! text.length) return;
      if (isNaN(text)) return;

      var value = parseInt(text, 10);
      if (typeof min === 'undefined') min = value;
      min = Math.min(min, value);

      if (typeof max === 'undefined') max = value;
      max = Math.max(max, value);

      histogramData.push(value);
    });

    console.log('min: ' + min + ' max: ' + max);

    var histogram = RD.Graphs.Histogram.create();
    histogram.init({
      root: '#histogram-graph',
      data: histogramData,
      ticks: Math.min(histogramData.length, 75),
      width: DOMinator('#histogram-graph').nth(0).clientWidth,
      height: '350'
    });
    histogram.render();

    DOMinator('#histogram-data').hide();
  }


  function cdfGraph() {
    var cdfDataEls = DOMinator('#cdf-data tr');
    if (! cdfDataEls.length) return;
    var cdfData = [];

    cdfDataEls.forEach(function(rowEl) {
      var x = DOMinator(rowEl).find('.elapsed-time').inner().trim();
      if (! x.length) return;
      if (isNaN(x)) return;

      var y = DOMinator(rowEl).find('.cdf').inner().trim();
      if (! y.length) return;
      if (isNaN(y)) return;

      var yVal = parseFloat(y);
      // cut off at 98%, going all the way to 100% results in often very
      // skewed graphs.
      if (yVal > 0.98) return;

      cdfData.push({
        x: parseInt(x, 10),
        y: parseFloat(y)
      });
    });

    console.log('cdf data', JSON.stringify(cdfData));

    var cdf = RD.Graphs.CDF.create();
    cdf.init({
      root: '#cdf-graph',
      data: cdfData,
      width: DOMinator('#cdf-graph').nth(0).clientWidth,
      height: '350'
    });
    cdf.render();

    DOMinator('#cdf-data').hide();
  }



}());

