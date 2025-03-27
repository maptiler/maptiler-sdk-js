/**
 * Adds performance statistics to the page.
 */
function addPerformanceStats() {
  const script = document.createElement("script");

  script.onload = function () {
    const stats = new Stats();
    stats.dom.style.top = "unset";
    stats.dom.style.bottom = "0";
    document.body.appendChild(stats.dom);

    requestAnimationFrame(function loop() {
      stats.update();
      requestAnimationFrame(loop);
    });
  };

  script.src = "https://mrdoob.github.io/stats.js/build/stats.min.js";

  document.head.appendChild(script);
}

/**
 * Configures the MapTiler API key for the SDK.
 * If you don't want to use the URL parameter, you can set the key directly in the code.
 */
function setupMapTilerApiKey() {
  maptilersdk.config.apiKey = localStorage.getItem('MT_DEMO_API_KEY') ?? new URLSearchParams(location.search).get("key") ?? "API_KEY";
  
  if (localStorage.getItem('MT_DEMO_API_KEY') === null) {
    localStorage.setItem(
      'MT_DEMO_API_KEY',
      maptilersdk.config.apiKey
    );
  }

  if (maptilersdk.config.apiKey === "API_KEY") {
    const errorMessage = "MapTiler API key is missing. Please use URL `key` parameter to set it (`?key=XXXXX`).";
    alert(errorMessage);
    throw new Error(errorMessage);
  }
}
