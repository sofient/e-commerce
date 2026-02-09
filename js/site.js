// Site micro-interactions and small utilities
(function(){
  function prefersReducedMotion(){
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  document.addEventListener('DOMContentLoaded', function(){
    // Back to top button
    var btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.setAttribute('aria-label','Remonter en haut');
    btn.innerHTML = '↑';
    document.body.appendChild(btn);

    function toggleBtn(){
      if(window.scrollY > 300) btn.style.display = 'flex';
      else btn.style.display = 'none';
    }
    toggleBtn();
    window.addEventListener('scroll', toggleBtn, {passive:true});
    btn.addEventListener('click', function(){
      if(prefersReducedMotion()) window.scrollTo(0,0);
      else window.scrollTo({top:0,behavior:'smooth'});
    });

    // Make product-cards keyboard accessible
    document.querySelectorAll('.product-card').forEach(function(card, i){
      card.setAttribute('tabindex', '0');
      card.addEventListener('keypress', function(e){
        if(e.key === 'Enter'){ var a = card.querySelector('.product-link'); if(a) a.click(); }
      });
      // mark for stagger appearance
      card.style.setProperty('--stagger-index', i);
    });

    // Button click visual feedback for buy buttons
    document.querySelectorAll('.btn-buy').forEach(function(b){
      b.addEventListener('pointerdown', function(){ b.style.transform = 'scale(.98)'; });
      b.addEventListener('pointerup', function(){ b.style.transform = ''; });
      b.addEventListener('pointerleave', function(){ b.style.transform = ''; });
    });

    // Add fade-in-up class to targets for animation
    document.querySelectorAll('.product-card, .product-hero, .hero h1, .hero p').forEach(function(el){ el.classList.add('fade-in-up'); });

    // IntersectionObserver to reveal elements when visible (respect reduced-motion)
    if(!prefersReducedMotion()){
      var io = new IntersectionObserver(function(entries, obs){
        entries.forEach(function(entry){
          if(entry.isIntersecting){ entry.target.classList.add('in-view'); obs.unobserve(entry.target); }
        });
      }, {threshold: 0.12});

      document.querySelectorAll('.fade-in-up').forEach(function(el){ io.observe(el); });
    } else {
      // If user prefers reduced motion, reveal immediately
      document.querySelectorAll('.fade-in-up').forEach(function(el){ el.classList.add('in-view'); });
    }

    // Header shrink and hero parallax
    var header = document.querySelector('header');
    var heroTitle = document.querySelector('.hero h1');
    function onScroll(){
      if(window.scrollY > 60) header.classList.add('shrink'); else header.classList.remove('shrink');
      if(heroTitle){ var y = Math.min(20, window.scrollY * 0.08); heroTitle.style.transform = 'translateY(' + y + 'px)'; }
    }
    onScroll();
    window.addEventListener('scroll', onScroll, {passive:true});

    // Small periodic CTA pulse (only if motion allowed)
    if(!prefersReducedMotion()){
      setInterval(function(){
        document.querySelectorAll('.snipcart-checkout').forEach(function(btn){
          btn.animate([{transform:'translateY(0)'},{transform:'translateY(-3px)'},{transform:'translateY(0)'}],{duration:1200,iterations:1});
        });
      }, 6000);
    }

    // Smooth in-page anchor navigation (respect prefers-reduced-motion)
    if(!prefersReducedMotion()){
      document.querySelectorAll('a[href^="#"]').forEach(function(a){
        a.addEventListener('click', function(e){
          var id = a.getAttribute('href').slice(1);
          var target = document.getElementById(id);
          if(target){ e.preventDefault(); target.scrollIntoView({behavior:'smooth', block:'start'}); }
        });
      });
    }

    // Gallery Carousel
    document.querySelectorAll('.gallery-grid').forEach(function(grid){
      var images = grid.querySelectorAll('img');
      if(images.length < 2) return;

      // Wrap in carousel-wrapper
      var wrapper = document.createElement('div');
      wrapper.className = 'carousel-wrapper';
      grid.parentNode.insertBefore(wrapper, grid);
      wrapper.appendChild(grid);

      // Arrows
      var prev = document.createElement('button');
      prev.className = 'carousel-btn prev';
      prev.setAttribute('aria-label','Photo précédente');
      prev.innerHTML = '&#8249;';
      wrapper.appendChild(prev);

      var next = document.createElement('button');
      next.className = 'carousel-btn next';
      next.setAttribute('aria-label','Photo suivante');
      next.innerHTML = '&#8250;';
      wrapper.appendChild(next);

      // Dots
      var dots = document.createElement('div');
      dots.className = 'carousel-dots';
      images.forEach(function(_, i){
        var dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label','Photo ' + (i+1));
        dot.addEventListener('click', function(){ scrollToSlide(i); });
        dots.appendChild(dot);
      });
      wrapper.parentNode.insertBefore(dots, wrapper.nextSibling);

      function scrollToSlide(index){
        var target = images[index];
        if(target) grid.scrollTo({ left: target.offsetLeft - grid.offsetLeft, behavior: 'smooth' });
      }

      function updateDots(){
        var scrollLeft = grid.scrollLeft;
        var width = grid.offsetWidth;
        var index = Math.round(scrollLeft / width);
        dots.querySelectorAll('.carousel-dot').forEach(function(d, i){
          d.classList.toggle('active', i === index);
        });
      }

      prev.addEventListener('click', function(){
        grid.scrollBy({ left: -grid.offsetWidth, behavior: 'smooth' });
      });
      next.addEventListener('click', function(){
        grid.scrollBy({ left: grid.offsetWidth, behavior: 'smooth' });
      });

      grid.addEventListener('scroll', updateDots, {passive:true});
    });
  });
})();

/* Snipcart stock-check: mark out-of-stock products as "Épuisé" */
function markOutOfStock(){
  if(!(window.Snipcart && window.Snipcart.api && window.Snipcart.api.products)) return;
  window.Snipcart.api.products.all().then(function(items){
    items.forEach(function(item){
      var out = false;
      if(typeof item.stock !== 'undefined'){ if(item.stock === 0) out = true; }
      else if(item.inventory && item.inventory.stock === 0) out = true;
      if(out){
        var selectors = [
          '.snipcart-add-item[data-item-id="'+(item.id||'')+'"]',
          '.snipcart-add-item[data-item-name="'+(item.name||'')+'"]'
        ];
        selectors.forEach(function(sel){
          document.querySelectorAll(sel).forEach(function(b){
            b.disabled = true; b.textContent = 'Épuisé'; b.classList.add('out-of-stock'); b.setAttribute('aria-disabled','true');
          });
        });
      }
    });
  });
}
if(window.Snipcart && window.Snipcart.events){
  window.Snipcart.events.on('snipcart.initialized', markOutOfStock);
  window.Snipcart.events.on('cart.items.updated', markOutOfStock);
  window.Snipcart.events.on('cart.closed', markOutOfStock);
}
document.addEventListener('DOMContentLoaded', function(){ setTimeout(markOutOfStock, 600); });