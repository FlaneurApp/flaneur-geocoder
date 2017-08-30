'use strict';

const chai = require('chai')
const should = chai.should()
// const assert = chai.assert
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const FlaneurGeocoder = require('../lib/flaneur-geocoder')

describe('FlaneurGeocoder', function() {
  describe('#findWhereIs', function() {
    it('should return a valid response with latitude/longitude', function(done) {
      const geocoder = new FlaneurGeocoder(process.env.GOOGLE_PLACES_FLANEUR_API_KEY)
      geocoder.findWhereIs(48.8381, 2.2805)
      .then((result) => {
        result.enPoliticalComponents.locality.should.eq('Paris')
        result.enPoliticalComponents.administrative_area_level_2.should.eq('Paris')
        result.enPoliticalComponents.administrative_area_level_1.should.eq('Île-de-France')
        result.enPoliticalComponents.country.should.eq('France')
      })
      .should.notify(done)
    })

    it('should return results in English', function(done) {
      const geocoder = new FlaneurGeocoder(process.env.GOOGLE_PLACES_FLANEUR_API_KEY)
      geocoder.findWhereIs(41.3772, 2.1502)
      .then((result) => {
        result.enPoliticalComponents.locality.should.eq('Barcelona')
      })
      .should.notify(done)
    })

    it('should return a valid response with a Google Place ID', function(done) {
      const geocoder = new FlaneurGeocoder(process.env.GOOGLE_PLACES_FLANEUR_API_KEY)
      geocoder.findWhereIs('ChIJjaFImcB65kcRXCzvbEBQJN0')
      .then((result) => {
        result.enPoliticalComponents.locality.should.eq('Paris')
        result.enPoliticalComponents.administrative_area_level_2.should.eq('Paris')
        result.enPoliticalComponents.administrative_area_level_1.should.eq('Île-de-France')
        result.enPoliticalComponents.country.should.eq('France')
      })
      .should.notify(done)
    })
  })
})
