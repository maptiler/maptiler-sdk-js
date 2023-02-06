import { GeolocateControl, Marker } from "maplibre-gl";
import { DOMcreate } from "./tools";

export class CustomGeolocateControl extends GeolocateControl {
  _setupUI(supported: boolean) {
    this._container.addEventListener("contextmenu", (e: MouseEvent) =>
      e.preventDefault()
    );
    this._geolocateButton = DOMcreate(
      "button",
      "maplibregl-ctrl-geolocate",
      this._container
    );
    DOMcreate(
      "span",
      "maplibregl-ctrl-icon",
      this._geolocateButton
    ).setAttribute("aria-hidden", "true");
    this._geolocateButton.type = "button";

    if (supported === false) {
      // warnOnce('Geolocation support is not available so the GeolocateControl will be disabled.');
      const title = this._map._getUIString(
        "GeolocateControl.LocationNotAvailable"
      );
      this._geolocateButton.disabled = true;
      this._geolocateButton.title = title;
      this._geolocateButton.setAttribute("aria-label", title);
    } else {
      const title = this._map._getUIString("GeolocateControl.FindMyLocation");
      this._geolocateButton.title = title;
      this._geolocateButton.setAttribute("aria-label", title);
    }

    if (this.options.trackUserLocation) {
      this._geolocateButton.setAttribute("aria-pressed", "false");
      this._watchState = "OFF";
    }

    // when showUserLocation is enabled, keep the Geolocate button disabled until the device location marker is setup on the map
    if (this.options.showUserLocation) {
      this._dotElement = DOMcreate("div", "maplibregl-user-location-dot");

      this._userLocationDotMarker = new Marker(this._dotElement);

      this._circleElement = DOMcreate(
        "div",
        "maplibregl-user-location-accuracy-circle"
      );
      this._accuracyCircleMarker = new Marker({
        element: this._circleElement,
        pitchAlignment: "map",
      });

      if (this.options.trackUserLocation) this._watchState = "OFF";

      this._map.on("zoom", this._onZoom);
    }

    this._geolocateButton.addEventListener("click", this.trigger.bind(this));

    this._setup = true;

    // when the camera is changed (and it's not as a result of the Geolocation Control) change
    // the watch mode to background watch, so that the marker is updated but not the camera.
    if (this.options.trackUserLocation) {
      this._map.on("movestart", (event: any) => {
        const fromResize =
          event.originalEvent && event.originalEvent.type === "resize";
        if (
          !event.geolocateSource &&
          this._watchState === "ACTIVE_LOCK" &&
          !fromResize
        ) {
          this._watchState = "BACKGROUND";
          this._geolocateButton.classList.add(
            "maplibregl-ctrl-geolocate-background"
          );
          this._geolocateButton.classList.remove(
            "maplibregl-ctrl-geolocate-active"
          );

          this.fire(new Event("trackuserlocationend"));
        }
      });
    }
  }
}
