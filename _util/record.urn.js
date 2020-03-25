/*
 *  _util/record.urn.js
 *
 *  David Janes
 *  Consensas
 *  2020-03-24
 *
 *  Copyright (2013-2020) David P. Janes
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

"use strict"

const _ = require("iotdb-helpers")

/**
 */
const record_urn = (...ds) => {
    const _util = require(".")

    const side = {
        addressCountry: "",
        addressLocality: "",
        addressRegion: null,
    }

    ds.forEach(d => {
        if (d.addressRegion) {
            side.addressRegion = d.addressRegion.toLowerCase()
        }
        if (d.addressCountry) {
            side.addressCountry = d.addressCountry.toLowerCase()
        }
        if (d.addressLocality) {
            side.addressLocality = d.addressLocality.toLowerCase().replace(/[^a-z]/g, "-").replace(/-+/g, "-")
        }
        if (d.authority) {
            side.authority = d.authority.toLowerCase()
        }
        if (d.dataset) {
            side.dataset = d.dataset.toLowerCase()
        }
        if (d.date) {
            side.date = d.date
        }
    })

    if (side.authority && side.dataset) {
        let result = `urn:covid19:${side.authority}:${side.dataset}:${side.addressCountry}-${side.addressRegion}`
        if (side.addressLocality) {
            result += `-${side.addressLocality}`
        }
        if (side.date) {
            result += `:${side.date}`
        }

        return result
    } else {
        return null
    }
}

/**
 *  API
 */
module.exports = record_urn
