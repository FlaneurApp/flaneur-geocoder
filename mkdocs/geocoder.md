# Geocoder

Here are some explanations about the I/O of the module.

## Inputs

Two inputs are accepted:

* Coordinate: the module returns information about the locality the coordinate are in
* Google Place ID: the module main focus is to return results regarding google places
  with a `political` type.

## Outputs

| Name | Description (relative to the Maps API response) |
|----|-----|
| `types` | A copy of the type of the Maps API response |
| `enPolicitalComponents` | A summary of the `political` address components |
| `name` | The name of the location |
| `location` | The coordonate of the location |
| `viewport` | The recommended viewport for the location |
| `searchSettings` | Recommended values for searching around the location |
| `searchSettings.coordinate` | The coordonate around which you should search |
| `searchSettings.tag` | The tag you should search for |
| `searchSettings.aroundPrecision` | The distance in meters that seems to return the best results for the search (computed from the recommended viewport) |
| `searchSettings.aroundRadius` | The distance in meters where it seems you should stop returning results for the search (computed from the recommended viewport) |
