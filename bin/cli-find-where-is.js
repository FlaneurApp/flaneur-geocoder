#!/usr/bin/env node

const FlaneurGeocoder = require('../index')

// Countries
const france = 'ChIJMVd4MymgVA0R99lHx5Y__Ws'
const spain = 'ChIJi7xhMnjjQgwR7KNoB5Qs7KY'
const italy = 'ChIJA9KNRIL-1BIRb15jJFz1LOI'

// Regions
const brittany = 'ChIJr45-rmHKEUgRsCTfNs2lDAE'

// Cities
const brest = 'ChIJk1uS2eG7FkgRqzCcF1iDSMY'
const barcelona = 'ChIJ5TCOcRaYpBIRCmZHTz37sEQ'
const paris = 'ChIJD7fiBh9u5kcRYJSMaMOCCwQ'
const boston = 'ChIJGzE9DS1l44kRoOhiASS_fHg'
const seattle = 'ChIJVTPokywQkFQRmtVEaUZlJRA'

const brestCoord =     { latitude: 48.390394,   longitude: -4.48607599  }
const barcelonaCoord = { latitude: 41.38506389, longitude: 2.1734035    }
const parisCoord =     { latitude: 48.856614,   longitude: 2.3522219    }
const bostonCoord =    { latitude: 42.3600825,  longitude: -71.0588801  }
const seattleCoord =   { latitude: 47.6062095,  longitude: -122.3320708 }

// Places
const brestTourDuMonde = 'ChIJo7G3fCC6FkgROZBxeqhK1T0'

const geocoder = new FlaneurGeocoder(process.env.GOOGLE_PLACES_FLANEUR_API_KEY, true)
geocoder.findWhereIs(48.8381, 2.2805)
.then((result) => {
  console.log(result)
})
.catch((e) => {
  console.error(e)
})
