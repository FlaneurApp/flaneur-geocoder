#!/usr/bin/env node

const FlaneurGeocoder = require('../index')

const photoRef = 'CmRaAAAAdEKCP8UcuyZiwaOe5Bxx-QLqgT1jhl3hJzq9abjOz-1nmqp41nNB2oMYyLxGzh5JbPEfaCU03SDQbASgCgbswDtrFAqrdX3OSHitjGMvJ6kaFCX5PEncLUVqFvT7God8EhDaEaFiWAGhs51D6iIgHX_FGhSQGCCckupTFjT06srPCfTFyiK9lg'

const geocoder = new FlaneurGeocoder({ verbose: true })
geocoder.findPhoto(photoRef)
