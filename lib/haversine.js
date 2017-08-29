const degreesToRadians = function(degrees) {
  return degrees * Math.PI / 180.0
}

const distanceBetween = function(lat1, long1, lat2, long2) {
  const earthRadius = 6371 // in km
  const dLat = degreesToRadians(lat2 - lat1)
  const dLong = degreesToRadians(long2 - long1)

  const hav = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(degreesToRadians(lat1)) * Math.cos(degreesToRadians(lat2)) * Math.sin(dLong / 2) * Math.sin(dLong / 2)
  const withoutRad = 2 * Math.atan2(Math.sqrt(hav), Math.sqrt(1 - hav))
  const result = earthRadius * withoutRad
  return result
}

module.exports = distanceBetween
