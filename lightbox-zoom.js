/*!
 * lightbox-zoom.js
 * Zoom tipo Canva para lightboxes de imagem.
 * Uso: createLightboxZoom(imgEl, stageEl, toolbarEl)
 *  - roda do rato: zoom centrado no cursor
 *  - arrastar: mover (pointer)
 *  - pinça: zoom no telemóvel
 *  - duplo-clique: alterna 100% / 250%
 *  - teclado: +, -, 0
 */
(function () {
  "use strict";

  var MIN_SCALE = 1;
  var MAX_SCALE = 8;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function distance(a, b) {
    var dx = a.clientX - b.clientX;
    var dy = a.clientY - b.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  window.createLightboxZoom = function (img, stage, toolbar) {
    if (!img || !stage) return null;

    var state = { scale: 1, x: 0, y: 0 };
    var percentEl = toolbar ? toolbar.querySelector("[data-zoom-percent]") : null;
    var dragging = false;
    var dragStart = null;
    var pinchStart = null;
    var activePointers = {};

    function isImageVisible() {
      return img.style.display !== "none" && !!img.getAttribute("src");
    }

    function apply(animate) {
      img.style.transformOrigin = "center center";
      img.style.transform = "translate(" + state.x + "px," + state.y + "px) scale(" + state.scale + ")";
      img.style.transition = animate ? "transform .18s ease-out" : "none";
      img.style.cursor = state.scale > 1.001 ? (dragging ? "grabbing" : "grab") : "zoom-in";
      stage.classList.toggle("is-zoomed", state.scale > 1.001);
      if (percentEl) percentEl.textContent = Math.round(state.scale * 100) + "%";
    }

    function clampPan() {
      var baseW = img.clientWidth;
      var baseH = img.clientHeight;
      if (!baseW || !baseH) return;
      var rect = stage.getBoundingClientRect();
      var margin = 48;
      var maxX = Math.max(0, (baseW * state.scale - (rect.width - margin)) / 2);
      var maxY = Math.max(0, (baseH * state.scale - (rect.height - margin)) / 2);
      state.x = clamp(state.x, -maxX, maxX);
      state.y = clamp(state.y, -maxY, maxY);
    }

    function setScale(next, clientX, clientY) {
      if (!isImageVisible()) return;
      next = clamp(next, MIN_SCALE, MAX_SCALE);
      if (Math.abs(next - state.scale) < 0.0005) return;

      var rect = img.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      var px = typeof clientX === "number" ? clientX : cx;
      var py = typeof clientY === "number" ? clientY : cy;
      var ratio = next / state.scale;

      state.x += (px - cx) * (1 - ratio);
      state.y += (py - cy) * (1 - ratio);
      state.scale = next;

      if (state.scale <= MIN_SCALE + 0.001) {
        state.scale = MIN_SCALE;
        state.x = 0;
        state.y = 0;
      }

      clampPan();
      apply(false);
    }

    function reset(animate) {
      state.scale = 1;
      state.x = 0;
      state.y = 0;
      apply(animate !== false);
    }

    function zoomIn() {
      setScale(state.scale * 1.5);
    }

    function zoomOut() {
      setScale(state.scale / 1.5);
    }

    /* roda do rato */
    stage.addEventListener(
      "wheel",
      function (e) {
        if (!isImageVisible()) return;
        e.preventDefault();
        var factor = Math.exp(-e.deltaY * 0.0022);
        setScale(state.scale * factor, e.clientX, e.clientY);
      },
      { passive: false }
    );

    /* duplo-clique alterna */
    img.addEventListener("dblclick", function (e) {
      if (!isImageVisible()) return;
      e.preventDefault();
      if (state.scale > 1.01) reset();
      else setScale(2.5, e.clientX, e.clientY);
    });

    /* arrastar com pointer */
    img.addEventListener("pointerdown", function (e) {
      if (!isImageVisible()) return;
      if (state.scale <= 1.001) return;
      if (e.button !== undefined && e.button !== 0) return;
      dragging = true;
      dragStart = { x: e.clientX - state.x, y: e.clientY - state.y };
      activePointers[e.pointerId] = true;
      try {
        img.setPointerCapture(e.pointerId);
      } catch (err) {}
      apply(false);
      e.preventDefault();
    });

    img.addEventListener("pointermove", function (e) {
      if (!dragging || !dragStart) return;
      state.x = e.clientX - dragStart.x;
      state.y = e.clientY - dragStart.y;
      clampPan();
      apply(false);
    });

    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      dragStart = null;
      if (e && e.pointerId != null) {
        delete activePointers[e.pointerId];
        try {
          img.releasePointerCapture(e.pointerId);
        } catch (err) {}
      }
      apply(false);
    }

    img.addEventListener("pointerup", endDrag);
    img.addEventListener("pointercancel", endDrag);

    /* pinça no telemóvel */
    stage.addEventListener(
      "touchstart",
      function (e) {
        if (!isImageVisible()) return;
        if (e.touches.length === 2) {
          pinchStart = {
            dist: distance(e.touches[0], e.touches[1]),
            scale: state.scale,
            cx: (e.touches[0].clientX + e.touches[1].clientX) / 2,
            cy: (e.touches[0].clientY + e.touches[1].clientY) / 2
          };
        }
      },
      { passive: true }
    );

    stage.addEventListener(
      "touchmove",
      function (e) {
        if (!pinchStart || e.touches.length !== 2 || !isImageVisible()) return;
        e.preventDefault();
        var dist = distance(e.touches[0], e.touches[1]);
        if (!pinchStart.dist) return;
        setScale(pinchStart.scale * (dist / pinchStart.dist), pinchStart.cx, pinchStart.cy);
      },
      { passive: false }
    );

    stage.addEventListener(
      "touchend",
      function (e) {
        if (e.touches.length < 2) pinchStart = null;
      },
      { passive: true }
    );

    /* barra de controlo */
    if (toolbar) {
      toolbar.addEventListener("click", function (e) {
        var btn = e.target.closest("button[data-zoom]");
        if (!btn) return;
        var action = btn.getAttribute("data-zoom");
        if (action === "in") zoomIn();
        else if (action === "out") zoomOut();
        else if (action === "reset") reset();
      });
    }

    /* teclado */
    document.addEventListener("keydown", function (e) {
      if (!stage.classList.contains("is-open") || !isImageVisible()) return;
      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        zoomIn();
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        zoomOut();
      } else if (e.key === "0") {
        e.preventDefault();
        reset();
      }
    });

    apply(false);

    return {
      reset: reset,
      zoomIn: zoomIn,
      zoomOut: zoomOut,
      getScale: function () {
        return state.scale;
      }
    };
  };
})();
