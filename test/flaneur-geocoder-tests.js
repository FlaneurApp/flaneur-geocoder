'use strict'

const chai = require('chai')
const should = chai.should()
// const assert = chai.assert
const chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)

const FlaneurGeocoder = require('../lib/flaneur-geocoder')

describe('FlaneurGeocoder', function () {
  describe('#findWhereIs', function () {
    it('should return a valid response with latitude/longitude', function (done) {
      const geocoder = new FlaneurGeocoder()
      geocoder.findWhereIs(48.8381, 2.2805)
        .then((result) => {
          result.enPoliticalComponents.locality.should.eq('Paris')
          result.enPoliticalComponents.administrative_area_level_2.should.eq('Paris')
          result.enPoliticalComponents.administrative_area_level_1.should.eq('Île-de-France')
          result.enPoliticalComponents.country.should.eq('France')
          result.name.should.eq('Paris')

          // The inputs arguments should be also returned in the result
          result.query.lat.should.eq(48.8381)
          result.query.lng.should.eq(2.2805)
        })
        .should.notify(done)
    })

    it('should return a valid response with latitude/longitude with another coordinates', function (done) {
      const geocoder = new FlaneurGeocoder()
      geocoder.findWhereIs(38.102, 13.0915833333)
        .then((result) => {
          result.enPoliticalComponents.administrative_area_level_3.should.eq('Terrasini')
          result.enPoliticalComponents.administrative_area_level_2.should.eq('Provincia di Palermo')
          result.enPoliticalComponents.administrative_area_level_1.should.eq('Sicilia')
          result.enPoliticalComponents.country.should.eq('Italy')
          result.name.should.eq('Terrasini')

          // The inputs arguments should be also returned in the result
          result.query.lat.should.eq(38.102)
          result.query.lng.should.eq(13.0915833333)
        })
        .should.notify(done)
    })

    it('should return results in English', function (done) {
      const geocoder = new FlaneurGeocoder()
      geocoder.findWhereIs(41.3772, 2.1502)
        .then((result) => {
          result.enPoliticalComponents.locality.should.eq('Barcelona')
        })
        .should.notify(done)
    })

    it('should convert string coordinate queries to numbers', function (done) {
      const geocoder = new FlaneurGeocoder()
      geocoder.findWhereIs('48.8381', '2.2805')
        .then((result) => {
          // The inputs arguments should be returned as Numbers
          result.query.lat.should.eq(48.8381)
          result.query.lng.should.eq(2.2805)
        })
        .should.notify(done)
    })

    it('should return a valid response with a Google Place ID', function (done) {
      const geocoder = new FlaneurGeocoder()
      geocoder.findWhereIs('ChIJjaFImcB65kcRXCzvbEBQJN0')
        .then((result) => {
          result.enPoliticalComponents.locality.should.eq('Paris')
          result.enPoliticalComponents.administrative_area_level_2.should.eq('Paris')
          result.enPoliticalComponents.administrative_area_level_1.should.eq('Île-de-France')
          result.enPoliticalComponents.country.should.eq('France')

          // The inputs arguments should be also returned in the result
          result.query.placeID.should.eq('ChIJjaFImcB65kcRXCzvbEBQJN0')
        })
        .should.notify(done)
    })

    it('accepts a custom function to compute aroundRadius', function (done) {
      const geocoder = new FlaneurGeocoder({
        aroundRadiusFn(viewportDiagonal) {
          return 4
        },
      })

      geocoder.findWhereIs('ChIJjaFImcB65kcRXCzvbEBQJN0')
        .then((result) => {
          result.searchSettings.aroundRadius.should.eq(4)
        })
        .should.notify(done)
    })

    it('accepts a custom function to compute aroundPrecision', function (done) {
      const geocoder = new FlaneurGeocoder({
        aroundPrecisionFn(viewportDiagonal) {
          return 5
        },
      })

      geocoder.findWhereIs('ChIJjaFImcB65kcRXCzvbEBQJN0')
        .then((result) => {
          result.searchSettings.aroundPrecision.should.eq(5)
        })
        .should.notify(done)
    })
  })
})
