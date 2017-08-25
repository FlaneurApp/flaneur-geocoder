# flaneur-geocoder

[![Build Status](https://travis-ci.org/FlaneurApp/flaneur-geocoder.svg?branch=master)](https://travis-ci.org/FlaneurApp/flaneur-geocoder)
![Dependencycy status](https://img.shields.io/david/FlaneurApp/flaneur-geocoder.svg?style=flat-square)
[![npm version](https://img.shields.io/npm/v/flaneur-geocoder.svg?style=flat-square)](https://www.npmjs.com/package/node-geocoder)

## Introduction

This module intends to help developers using Google Maps and Google Places API
to get consitent and complete geocoding returns.

It merges `political` types address components fetched from the service from
either coordinate or a Google Place ID. When a conflict occurs, a very basic
policy is applied: the shortest name is returned.

All results are returned in English when available.

## Usage

    const FlaneurGeocoder = require('flaneur-geocoder')
    const geocoder = new FlaneurGeocoder(myGooglePlacesAPIKey)
    geocoder.findWhereIs(48.8381, 2.2805)
    .then((result) => {
      console.log(result)
    })

Will ouput:

    {
      locality: 'Paris',
      administrative_area_level_2: 'Paris',
      administrative_area_level_1: 'Île-de-France',
      country: 'France',
      neighborhood: 'Javel',
      sublocality: '15th arrondissement of Paris',
      sublocality_level_1: '15th arrondissement of Paris'
    }

## Tests

As for regular usage, tests require a Google Places API Key. To run tests locally,
please setup a `GOOGLE_PLACES_FLANEUR_API_KEY` environment variable with your API key.

## CI

This project is using Travis. As such, maintainers should pay attention to provide
the API key set up with Travis machines IP addresses.
