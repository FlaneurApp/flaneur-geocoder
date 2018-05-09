# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [2.3.0] - 2018-05-09

### Changed
* Reworked the code for a more flexible location retrieval. The old behaviour, e.g.returning
  geocoded location only if the Google response includes the `locality` type, is still the default
  but can be bypassed by setting the `withLocalityOnly` option to `false` in the
  `_findFromCoordinate` function.
* Added the `withFormattedAddress` to `_findFromCoordinate` to include the formatted address in the
  response

### Added
* Added the `findWhereIsAddress` function, allowing the geocode from an address.

## [2.2.4] - 2017-09-14

### Changed

* When the query is a coordinate, it should always be returned as numbers in the response
  to`FlaneurGeocoder#findWhereIs`, even when the inputs were string #3

## 2.2.3

Removed as I messed up during the publication: `2.2.2` was still used in the
`package.json`. Please do not use.

## [2.2.2] - 2017-09-14

### Changed

* Include the queried arguments of `FlaneurGeocoder#findWhereIs` in the response #2

## [2.2.1] - 2017-08-30

### Added

* Allow `aroundPrecision` and `aroundRadius` computation functions as input #1
* `FlaneurGeocoder`'s constructor is now using a single `opts` object as an input

## About Older Versions

Older versions of this package were evolving at a really high pace.
The package was not stable enough and maintaining a Changelog would have a real
pain in the b***.

[2.2.1]: https://github.com/olivierlacan/keep-a-changelog/compare/v2.2.1...5db264d98c0fe1b93542bc0b0c0e0b93e2b8e47e
