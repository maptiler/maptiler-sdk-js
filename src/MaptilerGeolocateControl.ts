import type { LngLatLike, MapLibreEvent } from "maplibre-gl";
import maplibregl from "maplibre-gl";
import { GeolocateControl } from "./GeolocateControl";
import { DOMcreate } from "./tools";

const Marker = maplibregl.Marker;
const LngLat = maplibregl.LngLat;
const LngLatBounds = maplibregl.LngLatBounds;

type MoveEndEvent = MapLibreEvent<
  MouseEvent | TouchEvent | WheelEvent | undefined
> & { geolocateSource?: boolean };

/**
 * The MaptilerGeolocateControl is an extension of the original GeolocateControl
 * with a few changes. In this version, the active mode persists as long as the
 * location is still centered. This means it's robust to rotation, pitch and zoom.
 *
 */
export class MaptilerGeolocateControl extends GeolocateControl {
  private lastUpdatedCenter = new LngLat(0, 0);

  /**
   * Update the camera location to center on the current position
   *
   * @param {Position} position the Geolocation API Position
   * @private
   */
  _updateCamera = (position: GeolocationPosition) => {
    const center = new LngLat(
      position.coords.longitude,
      position.coords.latitude,
    );
    const radius = position.coords.accuracy;
    const bearing = this._map.getBearing();
    const options = {
      bearing,
      ...this.options.fitBoundsOptions,
      linear: true,
    };

    const currentMapZoom = this._map.getZoom();

    if (currentMapZoom > (this.options?.fitBoundsOptions?.maxZoom ?? 30)) {
      options.zoom = currentMapZoom;
    }

    this._map.fitBounds(LngLatBounds.fromLngLat(center, radius), options, {
      geolocateSource: true, // tag this camera change so it won't cause the control to change to background state
    });

    let hasFittingBeenDisrupted = false;

    const flagFittingDisruption = () => {
      hasFittingBeenDisrupted = true;
    };

    this._map.once("click", flagFittingDisruption);
    this._map.once("dblclick", flagFittingDisruption);
    this._map.once("dragstart", flagFittingDisruption);
    this._map.once("mousedown", flagFittingDisruption);
    this._map.once("touchstart", flagFittingDisruption);
    this._map.once("wheel", flagFittingDisruption);

    this._map.once("moveend", () => {
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
    });
  };

  _setupUI = (supported: boolean) => {
    this.lastUpdatedCenter = this._map.getCenter();

    this._container.addEventListener("contextmenu", (e: MouseEvent) =>
      e.preventDefault(),
    );
    this._geolocateButton = DOMcreate(
      "button",
      "maplibregl-ctrl-geolocate",
      this._container,
    );
    DOMcreate(
      "span",
      "maplibregl-ctrl-icon",
      this._geolocateButton,
    ).setAttribute("aria-hidden", "true");
    this._geolocateButton.type = "button";

    if (supported === false) {
      // warnOnce('Geolocation support is not available so the GeolocateControl will be disabled.');
      const title = this._map._getUIString(
        "GeolocateControl.LocationNotAvailable",
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
      this._userLocationDotMarker = new Marker({ element: this._dotElement });

      this._circleElement = DOMcreate(
        "div",
        "maplibregl-user-location-accuracy-circle",
      );
      this._accuracyCircleMarker = new Marker({
        element: this._circleElement,
        pitchAlignment: "map",
      });

      if (this.options.trackUserLocation) this._watchState = "OFF";

      this._map.on("move", this._onZoom);
    }

    this._geolocateButton.addEventListener("click", this.trigger.bind(this));

    this._setup = true;

    // when the camera is changed (and it's not as a result of the Geolocation Control) change
    // the watch mode to background watch, so that the marker is updated but not the camera.
    // Addition: Yet the status change does not occur if the ditance it has moved to is less than
    // one meter from the last auto-updated position. This is to guarrantee that if the move
    // is a zoom, rotation or pitch (where the center stays the same) then we can keep the ACTIVE_LOCK
    // mode ON.
    if (this.options.trackUserLocation) {
      this._map.on("moveend", (event: MoveEndEvent) => {
        const fromResize =
          event.originalEvent && event.originalEvent.type === "resize";
        const movingDistance = this.lastUpdatedCenter.distanceTo(
          this._map.getCenter(),
        );

        if (
          !event.geolocateSource &&
          this._watchState === "ACTIVE_LOCK" &&
          !fromResize &&
          movingDistance > 1
        ) {
          this._watchState = "BACKGROUND";
          this._geolocateButton.classList.add(
            "maplibregl-ctrl-geolocate-background",
          );
          this._geolocateButton.classList.remove(
            "maplibregl-ctrl-geolocate-active",
          );

          this.fire(new Event("trackuserlocationend"));
        }
      });
    }
  };

  _updateCircleRadius() {
    if (
      this._watchState !== "BACKGROUND" &&
      this._watchState !== "ACTIVE_LOCK"
    ) {
      return;
    }

    const lastKnownLocation: LngLatLike = [
      this._lastKnownPosition.coords.longitude,
      this._lastKnownPosition.coords.latitude,
    ];

    const projectedLocation = this._map.project(lastKnownLocation);
    const a = this._map.unproject([projectedLocation.x, projectedLocation.y]);
    const b = this._map.unproject([
      projectedLocation.x + 20,
      projectedLocation.y,
    ]);
    const metersPerPixel = a.distanceTo(b) / 20;

    const circleDiameter = Math.ceil((2.0 * this._accuracy) / metersPerPixel);
    this._circleElement.style.width = `${circleDiameter}px`;
    this._circleElement.style.height = `${circleDiameter}px`;
  }

  _onZoom = () => {
    if (this.options.showUserLocation && this.options.showAccuracyCircle) {
      this._updateCircleRadius();
    }
  };
}
