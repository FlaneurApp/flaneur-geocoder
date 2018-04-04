'use strict'

const chai = require('chai')
const should = chai.should()

const haversine = require('../lib/haversine')

const brest =   { latitude: 48.390394,  longitude: -4.48607599  }
const paris =   { latitude: 48.856614,  longitude: 2.3522219    }
const boston =  { latitude: 42.3600825, longitude: -71.0588801  }
const seattle = { latitude: 47.6062095, longitude: -122.3320708 }

describe('Haversine', function () {
  describe('#distanceBetween', function () {
    it('should know the distance between given cities and vice-versa', function () {
      Math.floor(haversine(brest.latitude, brest.longitude, paris.latitude, paris.longitude)).should.eq(505)
      Math.floor(haversine(paris.latitude, paris.longitude, brest.latitude, brest.longitude)).should.eq(505)
      Math.floor(haversine(boston.latitude, boston.longitude, seattle.latitude, seattle.longitude)).should.eq(4000)
      Math.floor(haversine(seattle.latitude, seattle.longitude, boston.latitude, boston.longitude)).should.eq(4000)
    })

    it('should deal with latitude overflow', function () {
      Math.floor(haversine(-179.9, 0.0, 179.9, 0.0)).should.eq(22)
    })
  })
})
