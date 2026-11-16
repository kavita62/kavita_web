/**
 * Kavita Uchila - media helpers
 * 1) Maps /uploads/<hash>.<ext> to pre-generated WebP/AVIF versions.
 * 2) Lazy-loads images and pauses offscreen videos.
 */
(function () {
  var IMG = /\/uploads\/([A-Za-z0-9_]+)\.(png|jpe?g|webp|avif)$/i;

  function optimized(url, fmt) {
    if (typeof url !== 'string') return null;
    var m = url.match(IMG);
    return m ? '/optimized/' + fmt + '/uploads/' + m[1] + '.' + fmt : null;
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  var api = {
    /** Best broadly-supported optimized URL (WebP), or the original. */
    src: function (url) { return optimized(url, 'webp') || url; },

    /**
     * Full <picture> with AVIF + WebP sources and a lazy <img>.
     * `attrs` is a raw attribute string already escaped by the caller.
     */
    picture: function (url, attrs) {
      attrs = attrs || '';
      var avif = optimized(url, 'avif');
      var webp = optimized(url, 'webp');
      var imgSrc = webp || url;
      var base = '<img src="' + esc(imgSrc) + '" ' + attrs +
        ' loading="lazy" decoding="async">';
      if (!avif && !webp) return base;
      return '<picture>' +
        (avif ? '<source srcset="' + esc(avif) + '" type="image/avif">' : '') +
        (webp ? '<source srcset="' + esc(webp) + '" type="image/webp">' : '') +
        base + '</picture>';
    },

    /** True on phones / portrait screens - carousel videos stay off there. */
    isVertical: function () {
      return !!(window.matchMedia &&
        window.matchMedia('(orientation: portrait), (max-width: 620px)').matches);
    },

    /** Carousel (hero flow + reel) videos, which we skip on vertical screens. */
    _isCarousel: function (v) {
      return !!(v.closest && v.closest('#flowTrack, #heroReel'));
    },

    /** Pause videos that scroll out of view; play the ones that enter. */
    initVideos: function () {
      var vids = document.querySelectorAll('video[data-kavita-lazy]');
      if (!vids.length) return;
      var vertical = api.isVertical();

      // Hide carousel video elements on vertical screens (CSS backgrounds remain).
      if (!api._styleInjected) {
        var style = document.createElement('style');
        style.textContent = '@media (orientation: portrait), (max-width: 620px){' +
          '.hero__flow-card video,.hero__reel-card video{display:none}}';
        document.head.appendChild(style);
        api._styleInjected = true;
      }

      function blocked(v) { return vertical && api._isCarousel(v); }

      vids.forEach(function (v) {
        if (!blocked(v)) return;
        v.pause();
        if (v.hasAttribute('src')) { v.removeAttribute('src'); v.load(); }
        v.setAttribute('data-kavita-lazy', 'paused');
      });

      if (!('IntersectionObserver' in window)) {
        vids.forEach(function (v) {
          if (blocked(v)) return;
          var src = v.getAttribute('data-src');
          if (src && !v.src) v.src = src;
          var p = v.play(); if (p && p.catch) p.catch(function () {});
        });
        return;
      }

      if (api._videoObserver) api._videoObserver.disconnect();
      api._videoObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          var v = e.target;
          if (blocked(v)) { v.pause(); return; }
          if (e.isIntersecting) {
            var src = v.getAttribute('data-src');
            if (src && !v.src) v.src = src;
            v.setAttribute('data-kavita-lazy', 'auto');
            var p = v.play();
            if (p && p.catch) p.catch(function () {});
          } else {
            v.pause();
          }
        });
      }, { rootMargin: '150px', threshold: 0.05 });
      vids.forEach(function (v) { if (!blocked(v)) api._videoObserver.observe(v); });
    }
  };

  // Re-evaluate when the device is rotated / viewport crosses the breakpoint.
  var lastVertical = api.isVertical();
  window.addEventListener('orientationchange', function () { setTimeout(api.initVideos, 120); });
  window.addEventListener('resize', function () {
    var now = api.isVertical();
    if (now !== lastVertical) { lastVertical = now; api.initVideos(); }
  });

  window.kavitaMedia = api;
})();
