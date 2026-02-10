/**
 * Polyfills for Safari support
 * requestIdleCallback and cancelIdleCallback
 */
(function () {
  // we do not want to polyfill this in node
  if (typeof window === "undefined") return;

  // polyfill requestIdleCallback (for Safari support)
  // this isn't a perfect polyfill, but it's good enough for our use case
  window.requestIdleCallback =
    window.requestIdleCallback ||
    function (cb) {
      const start = Date.now();
      return setTimeout(function () {
        cb({
          didTimeout: false,
          timeRemaining: function () {
            return Math.max(0, 50 - (Date.now() - start));
          },
        });
      }, 1);
    };

  window.cancelIdleCallback =
    window.cancelIdleCallback ||
    function (id) {
      clearTimeout(id);
    };
})();
