# flaneur-geocoder

[![Build Status](https://travis-ci.org/FlaneurApp/flaneur-geocoder.svg?style=flat-square)](https://travis-ci.org/FlaneurApp/flaneur-geocoder)
![Dependencycy status](https://img.shields.io/david/FlaneurApp/flaneur-geocoder.svg?style=flat-square)
[![npm version](https://img.shields.io/npm/v/flaneur-geocoder.svg?style=flat-square)](https://www.npmjs.com/package/flaneur-geocoder)

## Introduction

This module intends to help developers using Google Maps and Google Places API
to get consistent geocoding returns, with search-oriented information.

## Usage

```javascript
const FlaneurGeocoder = require('flaneur-geocoder')
const geocoder = new FlaneurGeocoder({ apiKey: ... })
geocoder.findWhereIs(48.8381, 2.2805)
.then((result) => {
    console.log(result)
})
```

Will ouput:

```
{ types: [ 'locality', 'political' ],
  enPoliticalComponents:
   { locality: 'Paris',
     administrative_area_level_2: 'Paris',
     administrative_area_level_1: 'Île-de-France',
     country: 'France' },
  name: 'Paris',
  location: { lat: 48.856614, lng: 2.3522219 },
  viewport:
   { northeast: { lat: 48.9021449, lng: 2.4699208 },
     southwest: { lat: 48.815573, lng: 2.224199 } },
  searchSettings:
   { coordinate: { lat: 48.856614, lng: 2.3522219 },
     tag: null,
     aroundPrecision: 5097.866542628929,
     aroundRadius: 40782.93234103143 } }
```

## Tests

As for regular usage, tests require a Google Places API Key. To run tests locally,
please setup a `GOOGLE_PLACES_FLANEUR_API_KEY` environment variable with your API key.

## CI

This project is using Travis. As such, maintainers should pay attention to provide
the API key set up with Travis machines IP addresses.
