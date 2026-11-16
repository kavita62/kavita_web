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

    /** Pause videos that scroll out of view; play the ones that enter. */
    initVideos: function () {
      var vids = document.querySelectorAll('video[data-kavita-lazy]');
      if (!vids.length) return;
      if (!('IntersectionObserver' in window)) {
        vids.forEach(function (v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); });
        return;
      }
      if (api._videoObserver) api._videoObserver.disconnect();
      api._videoObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          var v = e.target;
          if (e.isIntersecting) {
            var src = v.getAttribute('data-src');
            if (src && !v.src) v.src = src;
            if (v.getAttribute('data-kavita-lazy') !== 'paused') {
              var p = v.play();
              if (p && p.catch) p.catch(function () {});
            }
          } else {
            v.pause();
          }
        });
      }, { rootMargin: '150px', threshold: 0.05 });
      vids.forEach(function (v) { api._videoObserver.observe(v); });
    }
  };

  window.kavitaMedia = api;
})();
