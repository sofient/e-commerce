// Snipcart v3 — official installation pattern from docs.snipcart.com/v3/setup/installation
window.SnipcartSettings = {
  publicApiKey: 'YzNkN2VmYmUtNjZhMS00ODAyLTg1ODAtZjE4MDlmOGI5YzVlNjM5MDQxOTA1MjIzNzU4MTI1',
  loadStrategy: 'on-user-interaction',
  currency: 'eur',
  modalStyle: 'side',
  templatesUrl: 'https://sofient.github.io/e-commerce/snipcart-templates.html'
};

// Official Snipcart bootstrap (minified from docs)
(function(){
  var c,d;(d=(c=window.SnipcartSettings).version)!=null||(c.version="3.0");
  var s,S;(S=(s=window.SnipcartSettings).timeoutDuration)!=null||(s.timeoutDuration=2750);
  var l,p;(p=(l=window.SnipcartSettings).domain)!=null||(l.domain="cdn.snipcart.com");
  var w,u;(u=(w=window.SnipcartSettings).protocol)!=null||(w.protocol="https");
  var m,g;(g=(m=window.SnipcartSettings).loadCSS)!=null||(m.loadCSS=!0);

  var y=window.SnipcartSettings.version.includes("v3.0.0-ci")||
    window.SnipcartSettings.version!="3.0"&&
    window.SnipcartSettings.version.localeCompare("3.4.0",void 0,{numeric:!0,sensitivity:"base"})===-1;

  var f=["focus","mouseover","touchmove","scroll","keydown"];
  window.LoadSnipcart=o;
  document.readyState==="loading"?document.addEventListener("DOMContentLoaded",r):r();

  function r(){
    window.SnipcartSettings.loadStrategy
      ? window.SnipcartSettings.loadStrategy==="on-user-interaction"&&(
          f.forEach(function(t){return document.addEventListener(t,o)}),
          setTimeout(o,window.SnipcartSettings.timeoutDuration))
      : o();
  }

  var a=!1;
  function o(){
    if(a)return;a=!0;
    var t=document.getElementsByTagName("head")[0],
        n=document.querySelector("#snipcart"),
        i=document.querySelector('script[src^="'+window.SnipcartSettings.protocol+"://"+window.SnipcartSettings.domain+'"][src$="snipcart.js"]'),
        e=document.querySelector('link[href^="'+window.SnipcartSettings.protocol+"://"+window.SnipcartSettings.domain+'"][href$="snipcart.css"]');

    n||(n=document.createElement("div"),n.id="snipcart",n.setAttribute("hidden","true"),document.body.appendChild(n));
    h(n);

    i||(i=document.createElement("script"),
        i.src=window.SnipcartSettings.protocol+"://"+window.SnipcartSettings.domain+"/themes/v"+window.SnipcartSettings.version+"/default/snipcart.js",
        i.async=!0,t.appendChild(i));

    !e&&window.SnipcartSettings.loadCSS&&(
      e=document.createElement("link"),e.rel="stylesheet",e.type="text/css",
      e.href=window.SnipcartSettings.protocol+"://"+window.SnipcartSettings.domain+"/themes/v"+window.SnipcartSettings.version+"/default/snipcart.css",
      t.prepend(e));

    f.forEach(function(v){return document.removeEventListener(v,o)});
  }

  function h(t){
    !y||(
      t.dataset.apiKey=window.SnipcartSettings.publicApiKey,
      window.SnipcartSettings.addProductBehavior&&(t.dataset.configAddProductBehavior=window.SnipcartSettings.addProductBehavior),
      window.SnipcartSettings.modalStyle&&(t.dataset.configModalStyle=window.SnipcartSettings.modalStyle),
      window.SnipcartSettings.currency&&(t.dataset.currency=window.SnipcartSettings.currency),
      window.SnipcartSettings.templatesUrl&&(t.dataset.templatesUrl=window.SnipcartSettings.templatesUrl)
    );
  }
})();

// Conditional logic: disable Association dropdown unless "Pour une action/association" is selected
(function () {
  function initDestinationLogic() {
    var selects = document.querySelectorAll(
      'select[name*="Destination"], select[data-custom-field-name="Destination"]'
    );

    selects.forEach(function (destinationSelect) {
      var container = destinationSelect.closest(
        '.snipcart-item-line, .snipcart-cart-item, [class*="item"]'
      );
      if (!container) return;

      var associationSelect = container.querySelector(
        'select[name*="Association"], select[data-custom-field-name*="Association"]'
      );
      if (!associationSelect) return;

      function update() {
        var val = destinationSelect.value.toLowerCase();
        var isDonation = val.indexOf('association') !== -1;

        associationSelect.disabled = !isDonation;
        associationSelect.style.opacity = isDonation ? '1' : '0.4';
        associationSelect.style.cursor = isDonation ? 'pointer' : 'not-allowed';

        if (!isDonation) associationSelect.value = '';
      }

      update();
      destinationSelect.addEventListener('change', update);
    });
  }

  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.addedNodes.length) initDestinationLogic();
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
