const r = require('request')
const rp = require('request-promise')
const fs = require('fs')
const haversine = require('./haversine')

let verbose = false

class FlaneurGeocoder {
  constructor(apiKey, tmpVerbose = false) {
    if (apiKey) {
      this.apiKey = apiKey
      verbose = tmpVerbose
    } else {
      throw new Error('Missing API key.')
    }
  }

  findWhereIs(...args) {
    if (args.length === 2) {
      const latitude = args[0]
      const longitude = args[1]
      return this._findFromCoordinate(latitude, longitude)
    } else if (args.length === 1) {
      const googlePlaceID = args[0]
      return this._findFromGooglePlaceID(googlePlaceID)
    }
    throw new Error('Invalid args')
  }

  findPhoto(photoRef, outputName = 'photo') {
    r
      .get(`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoRef}&key=${this.apiKey}`)
      .on('error', (err) => {
        console.error(err)
      })
      .pipe(fs.createWriteStream(`${outputName}.jpg`))
  }

  _findPlaceDetails(placeID) {
    return rp(`https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeID}&language=en&key=${this.apiKey}`)
      .then(bodyString => JSON.parse(bodyString).result)
      .catch((e) => {
        console.error('findPlaceDetails:', e)
        return {}
      })
  }

  _findFromGooglePlaceID(placeID) {
    return this._findPlaceDetails(placeID)
      .then((placeDetails) => {
        if (placeDetails) {
          return FlaneurGeocoder._outputFromSingleGooglePlaceResult(placeDetails)
        }
        throw new Error(`Couldn't fetch details for place ${placeID}`)
      })
  }

  _findFromCoordinate(lat, lng) {
    return rp(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${this.apiKey}`)
      .then(bodyString => JSON.parse(bodyString))
      .then((responseObject) => {
        if (responseObject.results) {
          const localities = responseObject.results.filter(result => result.types && result.types.includes('locality'))

          if (localities.length === 1) {
            return FlaneurGeocoder._outputFromSingleGooglePlaceResult(localities[0])
          }
          throw new Error(`Couldn't find locality for coordainte ${lat}, ${lng}`)
        } else {
          throw new Error(`Couldn't fetch details for coordainte ${lat}, ${lng}`)
        }
      })
  }

  _findFromCoordinateLegacy(lat, lng) {
    return rp(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${this.apiKey}`)
      .then((bodyString) => {
        console.log(bodyString)
        return JSON.parse(bodyString)
      })
      .then((responseObject) => {
        if (responseObject.results) {
          const allPoliticalAddressComponents = responseObject.results
            .map(this._extractPoliticalComponents)
            .reduce(this._mergeObjects)
          return allPoliticalAddressComponents
        }
        console.error(`Empty response for ${lat}, ${lng}`)
        return {}
      })
      .catch((e) => {
        console.error('_findFromCoordinate:', e)
        return {}
      })
  }

  static _extractPoliticalComponents(objWithAddressComponents) {
    const result = {}
    objWithAddressComponents.address_components.forEach((addressComponent) => {
      if (addressComponent.types.includes('political')) {
        const filteredTypes = addressComponent.types.filter(elt => elt !== 'political')
        if (filteredTypes.length === 1) {
          const politicalType = filteredTypes[0]
          result[politicalType] = addressComponent.long_name
        } else if (filteredTypes.length === 0) {
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

  static _mergeObjects(accumulator, currentValue) {
    const newRes = accumulator
    Object.keys(currentValue).forEach((key) => {
      if (newRes[key] && newRes[key] !== currentValue[key]) {
        if (verbose) {
          console.warn(`Conflict for key ${key}: ${newRes[key]} != ${currentValue[key]}`)
        }
        if (newRes[key].length > currentValue[key].length) {
          newRes[key] = currentValue[key]
        }
      } else {
        newRes[key] = currentValue[key]
      }
    })
    return newRes
  }

  static _outputFromSingleGooglePlaceResult(gpResult) {
    const res = {}
    res.name = gpResult.name
    res.types = gpResult.types
    res.enPoliticalComponents = FlaneurGeocoder._extractPoliticalComponents(gpResult)

    // We need more information: location and size of the viewport
    if (gpResult.geometry && gpResult.geometry.location) {
      res.location = gpResult.geometry.location
    }

    if (gpResult.geometry && gpResult.geometry.viewport) {
      res.viewport = gpResult.geometry.viewport
    }

    // Now let's build the search recommendations
    const searchSettings = {}
    if (res.types.includes('country')) {
      searchSettings.coordinate = null
      searchSettings.tag = `country-${res.enPoliticalComponents.country}`
      searchSettings.aroundPrecision = null
      searchSettings.aroundRadius = null
    } else {
      searchSettings.coordinate = res.location
      searchSettings.tag = null
      if (res.viewport) {
        const p1 = res.viewport.northeast
        const p2 = res.viewport.southwest
        const viewportSize = haversine(p1.lat, p1.lng, p2.lat, p2.lng)
        searchSettings.aroundPrecision = (viewportSize * 1000.0) / 4.0
        searchSettings.aroundRadius = viewportSize * 1000.0 * 2.0
      } else {
        searchSettings.aroundPrecision = null
        searchSettings.aroundRadius = null
      }
    }
    res.searchSettings = searchSettings

    return res
  }
}

module.exports = FlaneurGeocoder
