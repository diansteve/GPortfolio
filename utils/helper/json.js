'use strict'

const variables = require('./variables')
const fs = require('fs')

/** @type {string} */
const BASE_PATH = variables.ROOT + '/cache/'

/**
 * Create cache folder if not exists
 */
if (!fs.existsSync(BASE_PATH)) {
  try {
    console.log('Create cache folder')
    fs.mkdirSync(BASE_PATH)
  } catch (e) {
    console.warn(e)
  }
}

module.exports = {

  /**
   * Get data from .json file if exists
   * @param {string} fileName - path in <root>/data folder (ext is required)
   * @return {{}}
   */
  tryReadJsonFile(fileName) {
    const path = BASE_PATH + fileName

    if (!fs.existsSync(path)) {
      return {}
    }

    const data = fs.readFileSync(path, { encoding: 'utf8' })

    try {
      return JSON.parse(data)
    } catch (e) {
      console.warn(e)
      return {}
    }
  },

  /**
   * Set data to .json file
   * @param {string} fileName - path in <root>/data folder (ext is required)
   * @param {object} data
   */
  writeJsonFile(fileName, data) {
    const path = BASE_PATH + fileName

    fs.writeFileSync(path, JSON.stringify(data), { encoding: 'utf8' })
  },

  /**
   * Check if .json file exists
   * @param {string} fileName - path in <root>/data folder (ext is required)
   * @return {boolean}
   */
  existsJsonFile(fileName) {
    return fs.existsSync(BASE_PATH + fileName)
  }
}
