#!/usr/bin/env node

const FlaneurGeocoder = require('../index')

// Countries
const france = 'ChIJMVd4MymgVA0R99lHx5Y__Ws'
const spain = 'ChIJi7xhMnjjQgwR7KNoB5Qs7KY'
const italy = 'ChIJA9KNRIL-1BIRb15jJFz1LOI'

// Regions
const brittany = 'ChIJr45-rmHKEUgRsCTfNs2lDAE'
const california = 'ChIJPV4oX_65j4ARVW8IJ6IJUYs'

// Cities
const brest = 'ChIJk1uS2eG7FkgRqzCcF1iDSMY'
const barcelona = 'ChIJ5TCOcRaYpBIRCmZHTz37sEQ'
const paris = 'ChIJD7fiBh9u5kcRYJSMaMOCCwQ'
const boston = 'ChIJGzE9DS1l44kRoOhiASS_fHg'
const seattle = 'ChIJVTPokywQkFQRmtVEaUZlJRA'
const lisbon = 'ChIJO_PkYRozGQ0R0DaQ5L3rAAQ'

const brestCoord =     { latitude: 48.390394,   longitude: -4.48607599  }
const barcelonaCoord = { latitude: 41.38506389, longitude: 2.1734035    }
const parisCoord =     { latitude: 48.856614,   longitude: 2.3522219    }
const bostonCoord =    { latitude: 42.3600825,  longitude: -71.0588801  }
const seattleCoord =   { latitude: 47.6062095,  longitude: -122.3320708 }

// Places
const brestTourDuMonde = 'ChIJo7G3fCC6FkgROZBxeqhK1T0'

const geocoder = new FlaneurGeocoder()
geocoder.findWhereIs(lisbon)
.then((result) => {
  console.log(result)

  console.log('\n # Useful Links:')
  console.log(`* NE: ${FlaneurGeocoder._mapsCenteredOnLocation(result.viewport.northeast.lat, result.viewport.northeast.lng)}`)
  console.log(`* SW: ${FlaneurGeocoder._mapsCenteredOnLocation(result.viewport.southwest.lat, result.viewport.southwest.lng)}`)
})
.catch((e) => {
  console.error(e)
})
