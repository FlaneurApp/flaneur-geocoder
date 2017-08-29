'use strict';

const r = require('request')
const rp = require('request-promise');
const fs = require('fs')
const haversine = require('./haversine')

let verbose = false

class FlaneurGeocoder {
  constructor(apiKey, tmpVerbose = false) {
    if (apiKey) {
      this.apiKey = apiKey
      verbose = tmpVerbose
    } else {
      throw new Error(`Missing API key.`)
    }
  }

  findWhereIs() {
    if (arguments.length === 2) {
      const latitude = arguments[0]
      const longitude = arguments[1]
      return this._findFromCoordinate(latitude, longitude)
    } else if (arguments.length === 1) {
      const googlePlaceID = arguments[0]
      return this._findFromGooglePlaceID(googlePlaceID)
    } else {
      throw new Error(`Invalid args`)
    }
  }

  findPhoto(photoRef, outputName = "photo") {
    r
    .get(`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoRef}&key=${this.apiKey}`)
    .on('error', function(err) {
      console.error(err)
    })
    .pipe(fs.createWriteStream(`${outputName}.jpg`))
  }

  _findPlaceDetails(placeID) {
    return rp(`https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeID}&language=en&key=${this.apiKey}`)
    .then((bodyString) => {
      return JSON.parse(bodyString).result
    })
    .catch((e) => {
      console.error(`findPlaceDetails:`, e)
      return {}
    })
  }

  _findFromGooglePlaceID(placeID) {
    return this._findPlaceDetails(placeID).then((placeDetails) => {
      if (placeDetails) {
        let res = {}
        res.name = placeDetails.name
        res.types = placeDetails.types
        res.enPoliticalComponents = this._extractPoliticalComponents(placeDetails)

        // We need more information: location and size of the viewport
        if (placeDetails.geometry && placeDetails.geometry.location) {
          res.location = placeDetails.geometry.location
        }

        if (placeDetails.geometry && placeDetails.geometry.viewport) {
          res.viewport = placeDetails.geometry.viewport
        }

        // Now let's build the search recommendations
        let searchSettings = {}
        if (res.types.includes('country')) {
          searchSettings.coordinate = null
          searchSettings.tag = 'country-' + res.enPoliticalComponents.country
          searchSettings.aroundPrecision = null
          searchSettings.aroundRadius = null
        } else {
          searchSettings.coordinate = res.location
          searchSettings.tag = null
          if (res.viewport) {
            let viewportSize = haversine(res.viewport.northeast.lat, res.viewport.northeast.lng, res.viewport.southwest.lat, res.viewport.southwest.lng)
            searchSettings.aroundPrecision = viewportSize * 1000.0 / 4.0
            searchSettings.aroundRadius = viewportSize * 1000.0 * 2.0
          } else {
            searchSettings.aroundPrecision = null
            searchSettings.aroundRadius = null
          }
        }
        res.searchSettings = searchSettings

        return res
      } else {
        throw new Error(`Couldn't fetch details for place ${placeID}`)
      }
    })
  }

  _findFromCoordinate(lat, lng) {
    return rp(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${this.apiKey}`)
    .then((bodyString) => {
      return JSON.parse(bodyString)
    })
    .then((responseObject) => {
      if (responseObject.results) {
        let allPoliticalAddressComponents = responseObject.results
        .map(this._extractPoliticalComponents)
        .reduce(this._mergeObjects)
        return allPoliticalAddressComponents
      } else {
        console.error(`Empty response for ${lat}, ${lng}`)
        return {}
      }
    })
    .catch((e) => {
      console.error(`_findFromCoordinate:`, e)
      return {}
    })
  }

  _extractPoliticalComponents(objWithAddressComponents) {
    let result = {}
    objWithAddressComponents.address_components.forEach((addressComponent) => {
      if (addressComponent.types.includes('political')) {
        let filteredTypes = addressComponent.types.filter((elt) => {
          return elt !== 'political'
        })
        if (filteredTypes.length == 1) {
          const politicalType = filteredTypes[0]
          result[politicalType] = addressComponent.long_name
        } else if (filteredTypes.length == 0) {
          if (verbose) {
            console.warn('Skipping political type with unique entity', addressComponent)
          }
        } else {
          if (verbose) {
            console.warn('Splitting type into multiple political components', addressComponent)
          }
          filteredTypes.forEach((subElt) => {
              result[subElt] = addressComponent.long_name
          })
        }
      }
    })
    return result
  }

  _mergeObjects(accumulator, currentValue, currentIndex, array) {
    Object.keys(currentValue).forEach((key) => {
      if (accumulator[key] && accumulator[key] !== currentValue[key]) {
        if (verbose) {
          console.warn(`Conflict for key ${key}: ${accumulator[key]} != ${currentValue[key]}`)
        }
        if (accumulator[key].length > currentValue[key].length) {
          accumulator[key] = currentValue[key]
        }
      } else {
        accumulator[key] = currentValue[key]
      }
    })
    return accumulator
  }
}

module.exports = FlaneurGeocoder
