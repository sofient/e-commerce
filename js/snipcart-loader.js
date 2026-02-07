// Snipcart configuration & lazy loader
// API key is fetched from the backend /api/v1/snipcart/config endpoint
// Fallback to a data attribute on <script> tag if backend is unavailable
(function () {
  'use strict';

  var scriptTag = document.currentScript;
  var fallbackKey = scriptTag ? scriptTag.getAttribute('data-api-key') : null;

  function initSnipcart(apiKey) {
    if (!apiKey) {
      console.error('Snipcart: no API key available');
      return;
    }

    window.SnipcartSettings = {
      publicApiKey: apiKey,
      loadStrategy: 'on-user-interaction',
      modalStyle: 'side',
      currency: 'eur',
      templatesUrl: 'snipcart-templates.html',
      version: '3.0',
      timeoutDuration: 2750,
      domain: 'cdn.snipcart.com',
      protocol: 'https'
    };

    var S = window.SnipcartSettings;
    var events = ['focus', 'mouseover', 'touchmove', 'scroll', 'keydown'];
    var loaded = false;

    window.LoadSnipcart = load;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setup);
    } else {
      setup();
    }

    function setup() {
      if (S.loadStrategy === 'on-user-interaction') {
        events.forEach(function (e) { document.addEventListener(e, load); });
        setTimeout(load, S.timeoutDuration);
      } else {
        load();
      }
    }

    function load() {
      if (loaded) return;
      loaded = true;

      var head = document.getElementsByTagName('head')[0];
      var snipcartDiv = document.querySelector('#snipcart');
      if (!snipcartDiv) {
        snipcartDiv = document.createElement('div');
        snipcartDiv.id = 'snipcart';
        snipcartDiv.setAttribute('hidden', 'true');
        document.body.appendChild(snipcartDiv);
      }

      snipcartDiv.dataset.apiKey = S.publicApiKey;
      if (S.modalStyle) snipcartDiv.dataset.configModalStyle = S.modalStyle;
      if (S.currency) snipcartDiv.dataset.currency = S.currency;
      if (S.templatesUrl) snipcartDiv.dataset.templatesUrl = S.templatesUrl;

      var js = document.createElement('script');
      js.src = S.protocol + '://' + S.domain + '/themes/v' + S.version + '/default/snipcart.js';
      js.async = true;
      head.appendChild(js);

      var css = document.createElement('link');
      css.rel = 'stylesheet';
      css.type = 'text/css';
      css.href = S.protocol + '://' + S.domain + '/themes/v' + S.version + '/default/snipcart.css';
      head.prepend(css);

      events.forEach(function (e) { document.removeEventListener(e, load); });
    }
  }

  // Use fallback key directly (avoids CORS/network dependency for static sites)
  if (fallbackKey) {
    initSnipcart(fallbackKey);
  }
})();
