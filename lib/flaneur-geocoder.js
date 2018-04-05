const r = require('request')
const rp = require('request-promise')
const fs = require('fs')
const haversine = require('./haversine')

const verbose = false

class FlaneurGeocoder {
  constructor(opts) {
    this.apiKey = (opts && opts.apiKey) || process.env.GOOGLE_PLACES_FLANEUR_API_KEY
    this.verbose = (opts && opts.verbose) || false
    this.aroundRadiusFn = (opts && opts.aroundRadiusFn) || FlaneurGeocoder._timesTwo
    this.aroundPrecisionFn = (opts && opts.aroundPrecisionFn) || FlaneurGeocoder._dividesByFour

    if (!this.apiKey) {
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
      .then(bodyString => JSON.parse(bodyString))
      .catch((e) => {
        // This should not happen, as google always send a response.
        console.error('findPlaceDetails:', e)
        return { error_message: e }
      })
  }

  _findFromGooglePlaceID(placeID) {
    return this._findPlaceDetails(placeID)
      .then((placeDetails) => {
        if (placeDetails.result) {
          return this._outputFromSingleGooglePlaceResult(placeDetails.result, { placeID })
        }
        if (placeDetails.error_message) {
          throw new Error(`Couldn't fetch details for place ${placeID}: ${placeDetails.error_message}`)
        } else {
          throw new Error(`Couldn't fetch details for place ${placeID}: ${placeDetails.status}`)
        }
      })
  }

  _findFromCoordinate(lat, lng, withLocalityOnly = false) {
    return rp(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${this.apiKey}`)
      .then(bodyString => JSON.parse(bodyString))
      .then((responseObject) => {
        if (responseObject.results) {
          // Filter predicate checking if the `types` array includes 'locality' 
          const includesLocality = (result => result.types && result.types.includes('locality'))
          // The resulting entries after filter application
          const filteredResults = responseObject.results.filter(includesLocality)
          // If withLocalityOnly is true, use only the filtered results.
          // Else, use in priority the filtered results but if none, use all the results.
          const localities = withLocalityOnly
            ? filteredResults
            : (filteredResults.length && filteredResults) || responseObject.results

          if (localities.length >= 1) {
            return this._outputFromSingleGooglePlaceResult(localities[0], {
              lat: Number(lat),
              lng: Number(lng),
            })
          }
          throw new Error(`Couldn't find locality for coordinates ${lat}, ${lng}`)
        } else {
          throw new Error(`Couldn't fetch details for coordinates ${lat}, ${lng}`)
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

  static _findPlaceName(politicalComponents) {
    const getLocality = function getLocality() {
      return politicalComponents.locality || politicalComponents.sublocality || null
    }

    const getHighestAdministrativeArea = function getHighestAdministrativeArea() {
      let found = false
      let level = 5
      do {
        if (politicalComponents[`administrative_area_level_${level}`]) {
          found = true
        } else {
          level -= 1
        }
      } while (!found && level)

      return level ? politicalComponents[`administrative_area_level_${level}`] : null
    }

    const getFirstPoliticalComponent = function getFirstPoliticalComponent() {
      return politicalComponents[Object.keys(politicalComponents)[0]]
    }

    return getLocality() || getHighestAdministrativeArea() || getFirstPoliticalComponent()
  }


  _outputFromSingleGooglePlaceResult(gpResult, query = null) {
    const res = {}

    res.types = gpResult.types
    res.enPoliticalComponents = FlaneurGeocoder._extractPoliticalComponents(gpResult)

    res.placeID = gpResult.place_id
    res.name = gpResult.name || FlaneurGeocoder._findPlaceName(res.enPoliticalComponents)

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
        const viewportSizeInMeters = haversine(p1.lat, p1.lng, p2.lat, p2.lng) * 1000.0
        searchSettings.aroundPrecision = this.aroundPrecisionFn(viewportSizeInMeters)
        searchSettings.aroundRadius = this.aroundRadiusFn(viewportSizeInMeters)
      } else {
        searchSettings.aroundPrecision = null
        searchSettings.aroundRadius = null
      }
    }
    res.searchSettings = searchSettings

    // Include the query as is if present
    if (query) {
      res.query = query
    }

    return res
  }

  static _mapsCenteredOnLocation(latitude, longitude) {
    return `https://www.google.com/maps/@?api=1&map_action=map&center=${latitude},${longitude}&zoom=5`
  }

  // This is the default for `aroundRadiusFn`
  static _timesTwo(viewportDiagonal) {
    return viewportDiagonal * 2.0
  }

  // This is the default for `aroundPrecisionFn`
  static _dividesByFour(viewportDiagonal) {
    return viewportDiagonal / 4.0
  }
}

module.exports = FlaneurGeocoder
