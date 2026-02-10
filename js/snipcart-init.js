// Snipcart v3 centralized setup using the recommended SnipcartSettings object.
(function () {
  var DEFAULT_CONFIG = {
    publicApiKey: 'YzNkN2VmYmUtNjZhMS00ODAyLTg1ODAtZjE4MDlmOGI5YzVlNjM5MDQxOTA1MjIzNzU4MTI1',
    currency: 'eur',
    modalStyle: 'side',
    templatesUrl: 'https://sofient.github.io/e-commerce/snipcart-templates.html',
    loadStrategy: 'on-user-interaction',
    version: '3.0'
  };

  window.SnipcartSettings = window.SnipcartSettings || {};

  Object.keys(DEFAULT_CONFIG).forEach(function (key) {
    if (window.SnipcartSettings[key] === undefined || window.SnipcartSettings[key] === null) {
      window.SnipcartSettings[key] = DEFAULT_CONFIG[key];
    }
  });

  // Loader aligned with Snipcart's installation pattern.
  (function bootstrapSnipcart() {
    var settings = window.SnipcartSettings;
    if (!settings.version) settings.version = '3.0';
    if (!settings.timeoutDuration) settings.timeoutDuration = 2750;
    if (!settings.domain) settings.domain = 'cdn.snipcart.com';
    if (!settings.protocol) settings.protocol = 'https';
    if (typeof settings.loadCSS === 'undefined') settings.loadCSS = true;

    var usesLegacyDataAttributes =
      settings.version.indexOf('v3.0.0-ci') !== -1 ||
      (settings.version !== '3.0' &&
        settings.version.localeCompare('3.4.0', undefined, {
          numeric: true,
          sensitivity: 'base'
        }) === -1);

    var events = ['focus', 'mouseover', 'touchmove', 'scroll', 'keydown'];
    var hasLoaded = false;

    window.LoadSnipcart = loadSnipcart;

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initLoadStrategy);
    } else {
      initLoadStrategy();
    }

    function initLoadStrategy() {
      if (!settings.loadStrategy) {
        loadSnipcart();
        return;
      }

      if (settings.loadStrategy === 'on-user-interaction') {
        events.forEach(function (eventName) {
          document.addEventListener(eventName, loadSnipcart, { passive: true });
        });
        setTimeout(loadSnipcart, settings.timeoutDuration);
        return;
      }

      if (settings.loadStrategy === 'manual') {
        return;
      }

      loadSnipcart();
    }

    function loadSnipcart() {
      if (hasLoaded) return;
      hasLoaded = true;

      var protocol = settings.protocol + '://';
      var base = protocol + settings.domain;
      var scriptPath = '/themes/v' + settings.version + '/default/snipcart.js';
      var stylePath = '/themes/v' + settings.version + '/default/snipcart.css';

      var head = document.head || document.getElementsByTagName('head')[0];
      var snipcartNode = document.querySelector('#snipcart');
      var scriptSelector = 'script[src="' + base + scriptPath + '"]';
      var styleSelector = 'link[href="' + base + stylePath + '"]';
      var scriptTag = document.querySelector(scriptSelector);
      var styleTag = document.querySelector(styleSelector);

      if (!snipcartNode) {
        snipcartNode = document.createElement('div');
        snipcartNode.id = 'snipcart';
        snipcartNode.setAttribute('hidden', 'true');
        document.body.appendChild(snipcartNode);
      }

      if (usesLegacyDataAttributes) {
        snipcartNode.dataset.apiKey = settings.publicApiKey;

        if (settings.addProductBehavior) {
          snipcartNode.dataset.configAddProductBehavior = settings.addProductBehavior;
        }

        if (settings.modalStyle) {
          snipcartNode.dataset.configModalStyle = settings.modalStyle;
        }

        if (settings.currency) {
          snipcartNode.dataset.currency = settings.currency;
        }

        if (settings.templatesUrl) {
          snipcartNode.dataset.templatesUrl = settings.templatesUrl;
        }
      }

      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.src = base + scriptPath;
        scriptTag.async = true;
        head.appendChild(scriptTag);
      }

      if (!styleTag && settings.loadCSS) {
        styleTag = document.createElement('link');
        styleTag.rel = 'stylesheet';
        styleTag.type = 'text/css';
        styleTag.href = base + stylePath;
        head.prepend(styleTag);
      }

      events.forEach(function (eventName) {
        document.removeEventListener(eventName, loadSnipcart);
      });
    }
  })();

  // Conditional logic: Destination -> Association beneficiary.
  function initDestinationLogic() {
    var destinationSelects = document.querySelectorAll(
      'select[name*="Destination"], select[data-custom-field-name="Destination"]'
    );

    destinationSelects.forEach(function (destinationSelect) {
      var container = destinationSelect.closest(
        '.snipcart-item-line, .snipcart-cart-item, [class*="item"]'
      );
      if (!container) return;

      var associationSelect = container.querySelector(
        'select[name*="Association"], select[data-custom-field-name*="Association"]'
      );
      if (!associationSelect) return;

      function updateAssociationState() {
        var normalizedValue = destinationSelect.value.toLowerCase();
        var isDonation =
          normalizedValue.indexOf('don') !== -1 || normalizedValue.indexOf('association') !== -1;

        associationSelect.disabled = !isDonation;
        associationSelect.style.opacity = isDonation ? '1' : '0.4';
        associationSelect.style.cursor = isDonation ? 'pointer' : 'not-allowed';

        if (!isDonation) {
          associationSelect.value = '';
        }
      }

      updateAssociationState();
      destinationSelect.addEventListener('change', updateAssociationState);
    });
  }

  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.addedNodes.length) {
        initDestinationLogic();
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
