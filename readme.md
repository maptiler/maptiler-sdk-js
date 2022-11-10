
<p align="center">
  <img src="images/maptiler-sdk-logo.svg" width="400px">
</p>

<p align="center" style="color: #AAA">
  The Javascript & TypeScript map SDK tailored for <a href="https://www.maptiler.com/cloud/">MapTiler Cloud</a>
</p>

<p align="center">
  <img src="images/JS-logo.svg" width="20px">
  <img src="images/TS-logo.svg" width="20px">
  <img src="https://img.shields.io/npm/v/@maptiler/sdk"></img>
  <img src="https://img.shields.io/twitter/follow/maptiler?style=social"></img>
</p>

# What and why?
The **MapTiler JS SDK** extends MapLibre GL JS, exposes all its features, and adds new ones on top. The SDK is designed to work with the well-established  [MapTiler Cloud service](https://www.maptiler.com/cloud/), which provides all the data required to fuel a complete web mapping experience: vector tiles, satellite raster tiles, DEM with Terrain RGB, custom styles with an editor, etc.  

**Why are we creating a new SDK?** To make things simpler for developers working in the MapTiler ecosystem! With **MapTiler JS SDK**, there is no need to load external plugins for the most basic things, copy-paste complex data source URLs, or look up the syntax to enable 3D terrain every time you start a project. All this is built-in, loaded when needed, or exposed with simple functions. Under the hood, this SDK is opinionated as it's being fed by [MapTiler Cloud](https://www.maptiler.com/cloud/) data, but its MapLibre core makes it 100% compatible with other sources.  

In addition, the MapTiler JS SDK provides well-documented and easy-to-use wrapper functions to the [MapTiler Cloud API services](https://docs.maptiler.com/cloud/api) such as: geocoding, static maps, geolocation, as well as a search engine for coordinate reference systems and transforming coordinates from one CRS to another.




# Install
```shell
npm install --save @maptiler/sdk
```

# API documentation
In addition to the details and examples provided in this readme, you can find a complete API documentation here: https://labs.maptiler.com/sdk

# Quick start
```ts
import * as maptiler from 'maptiler-js-sdk';

// Add your MapTiler Cloud API key to the config
// (Go to https://cloud.maptiler.com/account/keys/ to get one for free!)
maptiler.config.apiKey = 'YOUR_API_KEY';

// Let's say you have a DIV ready to receive a map
const mapContainer = document.getElementById('my-container-div');

// Instanciate the map
const map = new maptiler.Map({
  container: mapContainer,
});
```
By default, the map will be initialized with the style [streets-v2](https://www.maptiler.com/maps/#style=streets-v2).

# Many styles to choose from
MapTiler teams maintains a few styles that we have decided to expose from th SDK. This has two advantages:
- they are easier to remember, no need to type along style URL
- if we make an update to a style, you will benefit from it without modifying your codebase

Here is how it works:
```ts
import { Map, Style } from 'maptiler-js-sdk'
// When instanciating a map
const map = new Map({
  container: mapContainer,
  style: Style.OUTDOOR, // <-- the shorthand for the outdoor style
});

// Or later on, updating the style
map.setStyle(Style.DARK);
```

The styles with a shorthand provided by the SDK are the following:

| ID | Screenshot | Comment |
|:-:|:-:|:-:|
|`Style.STREETS`|![](images/screenshots/style-streets-v2.png)|The classic default style, perfect for urban areas|
|`Style.SATELLITE`|![](images/screenshots/style-satellite.png)|Only high resolution satellite raster tiles without any labels|
|`Style.HYBRID`|![](images/screenshots/style-hybrid.png)|Satellite tile with labels, landmarks, roads ways and political borders|
|`Style.OUTDOOR`|![](images/screenshots/style-outdoor.png)|A solid hiking companion, with peaks, parks, isolines and more|
|`Style.BASIC`|![](images/screenshots/style-basic-v2.png)|A minimalist alternative to `STREETS`, with a touch of flat design|
|`Style.DARK`|![](images/screenshots/style-streets-v2-dark.png)|A dark theme perfect to display data layers on top without losing any precious information|
|`Style.LIGHT`|![](images/screenshots/style-streets-v2-light.png)|Just like the `DARK`, but in bright mode! Your data layer as a first class citizen!|


Still, you can still use some classic styles with just a *string*:

```ts
map.setStyle('outdoor');
```

You can choose from the following:
- `bright`
- `openstreetmap`
- `pastel`
- `toner`
- `topo`
- `topographique`
- `voyager`
- `winter`

<p align="center">
  <img title="bright" src="images/screenshots/style-bright.png" width="12%"></img>
  <img title="openstreetmap" src="images/screenshots/style-osm.png" width="12%"></img>
  <img title="pastel" src="images/screenshots/style-pastel.png" width="12%"></img>
  <img title="toner" src="images/screenshots/style-toner.png" width="12%"></img> 
  <img title="topo" src="images/screenshots/style-topo.png" width="12%"></img>
  <img title="topographique" src="images/screenshots/style-topographique.png" width="12%"></img>
  <img title="voyager" src="images/screenshots/style-voyager.png" width="12%"></img>
  <img title="winter" src="images/screenshots/style-winter.png" width="12%"></img>
</p>

And finally, you can use your own custom styles designed with [our style editor](https://cloud.maptiler.com/maps/). Every custom style is given a unique ID, for instance: `c912ffc8-2360-487a-973b-59d037fb15b8`.

This ID can be provided as such:
```ts
map.setStyle("c912ffc8-2360-487a-973b-59d037fb15b8");
```

Or in its extended form:
```ts
map.setStyle("https://api.maptiler.com/maps/c912ffc8-2360-487a-973b-59d037fb15b8/style.json");
// this could be suffixed with the API token as well
```

And can even be provided in the URI form:
```ts
map.setStyle("maptiler://c912ffc8-2360-487a-973b-59d037fb15b8");
```

# Easy language switching
The language generally depends on the style but we made it possible to easily update it with a single function and from a built-in list of languages:

```ts
map.setLanguage(maptiler.languages.ENGLISH);
```

The special languages `maptiler.languages.LATIN` and `maptiler.languages.NON_LATIN` are generally the default ones in the styles developped by the MapTiler team and they are generaly safe all-around fallbacks.  

Some style, developped in-house as well as by the community, may support a secondary language. In this case, you can also update it:

```ts
map.setSecondaryLanguage(maptiler.languages.NON_LATIN);
```

Here is a sample of some compatible languages:
![](images/screenshots/multilang.gif)

> 📣 *__Note:__* the `Map` method `.setLanguage()` is shorthand for `.setPrimaryLanguage()`. Use the one that makes more sense to your usage.

> 📣 *__Note 2:__* Not all the labels are available in every languages. Depending on the style settings, a fallback to `maptiler.Language.LATIN` is likely tro happen.


# Built-in support for right-to-left languages
Languages that are written right-to-left such as arabic and hebrew are fully supported by default. No need to install any plugin!

<p align="center">
  <img src="images/screenshots/lang-arabic.png" width="48%"></img>
  <img src="images/screenshots/lang-hebrew.png" width="48%"></img>
</p>

# Easy access to MapTiler Cloud API
A map SDK is not only about maps! Here is the list of service wrapper functions that are built-in:

## 🔍 Geocoding
### Forward
You want to know the longitude and latitude of a specific place, use the forward geocoding:
```ts
// in an async function, or as a 'thenable':
const result = await maptiler.geocoding.forward('paris');
```
You can provide some options such as:
- the proximity, given a lon-lat position, to sort the results
- one of more languages to get the results into
- a bounding geo box, to restrict the search to a given window

Read more about forward geocoding on our official [API documentation](https://docs.maptiler.com/cloud/api/geocoding/#search-by-name-forward).

### Reverse
You wan to tknow the name of a place, given a longitude-latitude? Use the reverse geocoding:
```ts
// in an async function, or as a 'thenable':
const result = await maptiler.geocoding.reverse({ lng: 6.249638, lat: 46.402056 });
```
The same option object as the forward geocoding can be provided.

Read more about reverse geocoding on our official [API documentation](https://docs.maptiler.com/cloud/api/geocoding/#search-by-coordinates-reverse).

## 🕵️‍♂️ Geolocation
The geolocation service provides an accurate location insight of a website visitor using its IP address.

There is only a single function:
```ts
// in an async function, or as a 'thenable':
const result = await maptiler.geolocation.info();
```

Read more about geolocation on our official [API documentation](https://docs.maptiler.com/cloud/api/geolocation/).

## 🌐 Coordinates
If you are already familiar with [epsg.io](https://epsg.io/) (created by MapTiler), then you may find convenient to access the details of more than 10 thousands of coordinate reference systems (CRS) programmatically, as well as transforming coordinates from one system to another!

### Search
The `search` lets you perform a query in a free form fashion. Here are some examples:
```ts
// in an async function, or as a 'thenable':
const resultA = await maptiler.coordinates.search('mercator');
const resultB = await maptiler.coordinates.search('plate carree');
const resultC = await maptiler.coordinates.search('france');
const resultD = await maptiler.coordinates.search('code:4326', {transformations: true}));
```

The `transformations` options retrieves a lot more details about the CRS that MapTiler API is able to transform to/from than just their IDs.

Read more about searching coordinate systems on our official [API documentation](https://docs.maptiler.com/cloud/api/coordinates/#search-coordinate-systems).

### Transform
Transforming a couple of coordinates from one system to another can be challenging, for example, most countries have their own official system, yet web mapping tools are more often than not exclusive to [WGS84](https://epsg.io/4326).

If not provided, both the source (`sourceCrs`) and the destination (`targetCrs`) are default to **EPSG:4326** (in other words, [WGS84](https://epsg.io/4326)). Here is how to use this feature:

```ts
// in an async function, or as a 'thenable':

// Providing one coordinate to transform, with a target CRS being EPSG:9793 (RGF93 v2 / Lambert-93, France official CRS)
const resultA = await maptiler.coordinates.transform({lng: 1, lat: 45}, {targetCrs: 9793})

// Using the same logic, we can pass up to 50 coordinates to be transformed
const resultB = await maptiler.coordinates.transform([{lng: 10, lat: 48}, {lng: 1, lat: 45}], {targetCrs: 9793})
```

Read more about transforming coordinates on our official [API documentation](https://docs.maptiler.com/cloud/api/coordinates/#transform-coordinates).

## 💽 Data
MapTiler Cloud give its users the possibility to [upload and create data](https://cloud.maptiler.com/data/), manually with a user interface or by uploading a GPX, GeoJSON, KML or shp file. A unique ID is associated to each dataset so that we can later on access it programmatically to retrieve a GeoJSON equivalent of it:

```ts
// in an async function, or as a 'thenable':
const result = await maptiler.data.get('my-dataset-unique-id')
```

Since the result is a GeoJSON, it can easily be added to a `map` with `.addSource()` and `.addLayer()`.

## 🗺️ Static maps
Maptiler Cloud provides many possibilities for creating static maps as PNG, JPEG or WebP images. They all offer the possibilities to:
- Choose from one of the MapTiler style or your own
- Add markers with a custom icon (or default icon with custom color)
- Add path or polygon, with a parametric line width and color and a parametric filling color

Three modes are available: `centered`, `bounded` and `automatic`.

> 📣 *__important:__* Contrary to the geolocation/geocoding/coordinates/data service wrappers, the static maps function **does not** perform any query to the MapTiler API, instead they build the image URL. We took this decision because images are most likely going to be displayed  in `<img src="path.png"></img>` markups and will naturaly be fetched by the web browser.

### Centered static maps
This type of map is centered on a longitude-latitude coordinate and the zoom level must also be provided (from `0`: very zoomed out, to `22`: very zoomed in).  
Note that if a path or markers are provided, the framing of the map will not automatically adapt to include those (use the `automatic` mode for that).

```ts
const imageLink = maptiler.staticMaps.centered(
  // center position (Boston)
  {lng: -71.06080, lat: 42.362114}, 

  // zoom level
  12.5, 
  
  // Options
  {
    // Request a hiDPI/Retina image
    hiDPI: true,

    // Output image size
    width: 1000,
    height: 1000,

    // Map style
    style: 'streets-v2',
  });
```

Read more about centered static maps on our official [API documentation](https://docs.maptiler.com/cloud/api/static-maps/#center-based-image).


### Bounded static maps
This type of map requires a bounding box made of two points: the south-west bound and the north-east bound. The zoom level cannot be provided and is automatically deduced from the size of the bounding box.

```ts
const imageLink = maptiler.staticMaps.bounded(
  // The bounding box on Europe
  {
    southWest: { lng: -24, lat: 34.5 },
    northEast: { lng: 32, lat: 71 },
  },

  // Options
  {
    hiDPI: true,
    width: 2048,
    height: 2048,
    style: 'streets-v2',

    // Extra space that will add around the bounding box, in percentage
    // (0.1 = 10% is actually the dafault)
    padding: 0.1
  });
```

Since the zoom level cannot be provided, the level of details is dictated by the size of the output image. here is an example:

| `2048 x 2048`      | `1024 x 1024` |
| :-----------: | :-----------: |
| ![](images/screenshots/static-bounded-europe-2048.png)      | ![](images/screenshots/static-bounded-europe-1024.png)       |

As you may notice, the geo bounding box could have very different proportions than the output image size. In the following example, we place the very same bounding box around Portugal, which has a this particular strip looking shape. We also add a `path` that repeats exactely the same bounding box to show the difference between the provided bounding box and the final image. We kept the default padding of 10%:


| `2048 x 2048`      | `1024 x 2048` |
| :-----------: | :-----------: |
| ![](images/screenshots/static-bounded-portugal-2048x2048.png)      | ![](images/screenshots/static-bounded-portugal-1024x2048.png)       |


Read more about bounded static maps on our official [API documentation](https://docs.maptiler.com/cloud/api/static-maps/#bounds-based-image).

### Automatic static maps
As we have seen with centered and bounded maps, providing all the parameters is nice but can be cumbersome for the simplest use cases. This is why MapTiler Cloud also provides static maps that fits automatically whatever you need to place inside: path or markers.

In the following example, we are going to load a cycling track recorded by one of our team members in Montreal, Canada. The track, originally a GPX file, was pushed to MapTiler Data and is now made avalable as a GeoJSON:

```ts
// Fetching the GeoJSON
const bikeTrack = await maptiler.data.get('the-id-of-a-bike-track-in-montreal');

// Extracting the track points with the shape [[lng, lat], [lng, lat], ...]
const trackPoints = bikeTrack.features[0].geometry.coordinates[0]
  .map(p => p.slice(0, 2));

// We will need the starting point to create a nice marker
const departure = { lng: trackPoints[0][0], lat: trackPoints[0][1] };

const imageLink = maptiler.staticMaps.automatic({
  // hiDPI/Retina precision
  hiDPI: true,

  // A farily large output image
  width: 2048,
  height: 1024 ,

  // A grey style on which the track will pop!
  style: 'streets-v2-light',

  // Draw a path with the trackpoints
  path: trackPoints,

  // Adding a marker for the starting point, with a custom color
  marker: {lng: trackPoints[0][0], lat: trackPoints[0][1], color: '#0a0'},

  // Showing the track in red
  pathStrokeColor: 'red',
});
```

And voila!

![static map with bike path](images/screenshots/static-with-path.png)

> 📣 *__Note:__* The GeoJSON for this track contains 9380 couples of coordinates, which is a lot! In order to send the track to MapTiler Cloud static maps API, the SDK simplifies the long paths while keeing a high degree of precision using a very fast [Ramer-Douglas-Peucker algorithm](https://en.wikipedia.org/wiki/Ramer%E2%80%93Douglas%E2%80%93Peucker_algorithm).

Read more about bounded static maps on our official [API documentation](https://docs.maptiler.com/cloud/api/static-maps/#auto-fitted-image).
