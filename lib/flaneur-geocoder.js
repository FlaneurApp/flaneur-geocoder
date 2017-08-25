'use strict';

const rp = require('request-promise');

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
      if (placeDetails && placeDetails.address_components) {
        return this._extractPoliticalComponents(placeDetails)
      } else {
        console.error('No results for: ', placeID)
        return {}
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
