// Snipcart v3 — Configuration centralisée
// Un seul fichier à modifier pour changer la clé API, devise, templates, etc.
(function () {
  var CONFIG = {
    apiKey: 'YzNkN2VmYmUtNjZhMS00ODAyLTg1ODAtZjE4MDlmOGI5YzVlNjM5MDQxOTA1MjIzNzU4MTI1',
    currency: 'eur',
    modalStyle: 'side',
    templatesUrl: 'https://sofient.github.io/e-commerce/snipcart-templates.html'
  };

  var CDN = 'https://cdn.snipcart.com/themes/v3.0/default';
  var head = document.head;

  // Preconnect
  ['https://app.snipcart.com', 'https://cdn.snipcart.com'].forEach(function (url) {
    var link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    head.appendChild(link);
  });

  // CSS
  var css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = CDN + '/snipcart.css';
  head.appendChild(css);

  // JS
  var js = document.createElement('script');
  js.src = CDN + '/snipcart.js';
  js.async = true;
  head.appendChild(js);

  // #snipcart div
  var div = document.createElement('div');
  div.id = 'snipcart';
  div.hidden = true;
  div.setAttribute('data-api-key', CONFIG.apiKey);
  div.setAttribute('data-config-modal-style', CONFIG.modalStyle);
  div.setAttribute('data-currency', CONFIG.currency);
  if (CONFIG.templatesUrl) {
    div.setAttribute('data-templates-url', CONFIG.templatesUrl);
  }
  document.body.appendChild(div);

  // Logique conditionnelle Destination → Association
  function initDestinationLogic() {
    var selects = document.querySelectorAll(
      'select[name*="Destination"], select[data-custom-field-name="Destination"]'
    );

    selects.forEach(function (select) {
      var container = select.closest(
        '.snipcart-item-line, .snipcart-cart-item, [class*="item"]'
      );
      if (!container) return;

      var assocSelect = container.querySelector(
        'select[name*="Association"], select[data-custom-field-name*="Association"]'
      );
      if (!assocSelect) return;

      function update() {
        var isDon =
          select.value.toLowerCase().includes('don') ||
          select.value.toLowerCase().includes('association');

        assocSelect.disabled = !isDon;
        assocSelect.style.opacity = isDon ? '1' : '0.4';
        assocSelect.style.cursor = isDon ? 'pointer' : 'not-allowed';
        if (!isDon) assocSelect.value = '';
      }

      update();
      select.addEventListener('change', update);
    });
  }

  // Observer le DOM pour détecter les éléments Snipcart
  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      if (m.addedNodes.length) initDestinationLogic();
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
