import { GeolocateControl, LngLat, Marker, } from "maplibre-gl";
import { DOMcreate } from "./tools";


export class CustomGeolocateControl extends GeolocateControl {
  private lastUpdatedCenter: LngLat;
  private lastUpdatedZoom: number;

    /**
     * Update the camera location to center on the current position
     *
     * @param {Position} position the Geolocation API Position
     * @private
     */
  _updateCamera(position: GeolocationPosition) {
    const center = new LngLat(position.coords.longitude, position.coords.latitude);
    const radius = position.coords.accuracy;
    const bearing = this._map.getBearing();
    const options = {
      bearing,
      ...this.options.fitBoundsOptions,
    };

    console.log('moving camera');
    
    this._map.fitBounds(center.toBounds(radius), options, {
      geolocateSource: true // tag this camera change so it won't cause the control to change to background state
    });

    let hasFittingBeenDisrupted = false;

    const flagFittingDisruption = () => {
      console.log("DISRUPTED FITTING!");      
      hasFittingBeenDisrupted = true;
    }

    this._map.once("click", flagFittingDisruption);
    this._map.once("dblclick", flagFittingDisruption);
    this._map.once("dragstart", flagFittingDisruption);
    this._map.once("mousedown", flagFittingDisruption);
    this._map.once("touchstart", flagFittingDisruption);
    this._map.once("wheel", flagFittingDisruption);

    this._map.once("moveend", () => {
      console.log("done moving, with disruption:", hasFittingBeenDisrupted);
      
      // Removing the events if not used
      this._map.off("click", flagFittingDisruption);
      this._map.off("dblclick", flagFittingDisruption);
      this._map.off("dragstart", flagFittingDisruption);
      this._map.off("mousedown", flagFittingDisruption);
      this._map.off("touchstart", flagFittingDisruption);
      this._map.off("wheel", flagFittingDisruption);

      if (hasFittingBeenDisrupted) {
        return;
      }

      this.lastUpdatedCenter = this._map.getCenter();
      this.lastUpdatedZoom = this._map.getZoom();
    })
  }

  _setupUI(supported: boolean) {
    this.lastUpdatedCenter = this._map.getCenter();
    this.lastUpdatedZoom = this._map.getZoom();
    
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
        const fromResize = event.originalEvent && event.originalEvent.type === "resize";
        console.log(this._map.getZoom());
        
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
