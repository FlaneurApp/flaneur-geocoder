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

  describe('#findWhereIsAddress', function () {
    it('should throw an error with no argument', function () {
      const geocoder = new FlaneurGeocoder()
      return geocoder.findWhereIsAddress().should.be.rejectedWith('Invalid args')
    })

    it('should find the address', function () {
      const geocoder = new FlaneurGeocoder()
      const address = '101-199 Elm St, Idaho Falls, ID 83402, USA'
      const expectedResult = {
        types: ['street_address'],
        enPoliticalComponents: {
          locality: 'Idaho Falls',
          administrative_area_level_2: 'Bonneville County',
          administrative_area_level_1: 'Idaho',
          country: 'United States',
        },
        placeID: 'EiYxOTkgRWxtIFN0LCBJZGFobyBGYWxscywgSUQgODM0MDIsIFVTQQ',
        name: 'Idaho Falls',
        location: { lat: 43.489884, lng: -112.0374838 },
        viewport: {
          northeast: { lat: 43.4912329802915, lng: -112.0361348197085 },
          southwest: { lat: 43.4885350197085, lng: -112.0388327802915 },
        },
        searchSettings: {
          coordinate: { lat: 43.489884, lng: -112.0374838 },
          tag: null,
          aroundPrecision: 92.65883491616987,
          aroundRadius: 741.2706793293589,
        },
        query: { address: '101-199 Elm St, Idaho Falls, ID 83402, USA' },
      }

      return geocoder.findWhereIsAddress(address)
        .then(results => results.should.deep.equal(expectedResult))
    })

    it('should reject if there isn\'t a result with the locality type with the withLocalityOnly option', function () {
      const geocoder = new FlaneurGeocoder()
      const address = '101-199 Elm St, Idaho Falls, ID 83402, USA'

      return geocoder.findWhereIsAddress(address, { withLocalityOnly: true }).should.be.rejectedWith('Couldn\'t find locality')
    })

    it('Should return the formatted address with the withFormattedAddress option', function () {
      const geocoder = new FlaneurGeocoder()
      const address = '101-199 Elm St, Idaho Falls, ID 83402, USA'

      return geocoder.findWhereIsAddress(address, { withFormattedAddress: true })
        .then(results => results.should.have.property('formatted_address', '199 Elm St, Idaho Falls, ID 83402, USA'))
    })

    it('Should translate the address with the language option', function () {
      const geocoder = new FlaneurGeocoder()
      const address = '101-199 Elm St, Idaho Falls, ID 83402, USA'

      return geocoder.findWhereIsAddress(address, { withFormattedAddress: true, language: 'fr' })
        .then(results => results.should.have.property('formatted_address', '199 Elm St, Idaho Falls, ID 83402, États-Unis'))
    })
  })

  describe('#_findFromCoordinate', function () {
    it('should reject if there isn\'t a result with the locality type with the withLocalityOnly option', function () {
      const geocoder = new FlaneurGeocoder()
      return geocoder._findFromCoordinate(48.3951666667, -4.428, true).should.be.rejectedWith(Error)
    })

    it('should succeed even if there isn\'t a result with the locality type without the withLocalityOnly option ', function () {
      const geocoder = new FlaneurGeocoder()
      return geocoder._findFromCoordinate(48.3951666667, -4.428, false)
        .then((result) => {
          result.should.deep.include({
            enPoliticalComponents: {
              locality: 'Guipavas',
              administrative_area_level_2: 'Finistère',
              administrative_area_level_1: 'Bretagne',
              country: 'France',
            },
            placeID: 'Eig2IFJ1ZSBkZSBQYWxhcmVuLCAyOTQ5MCBHdWlwYXZhcywgRnJhbmNl',
            name: 'Guipavas',
            query: { lat: 48.3951666667, lng: -4.428 },
          })
          return true
        }).should.eventually.be.true
    })
  })
})
