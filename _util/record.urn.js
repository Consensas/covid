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
        country: "",
        locality: "",
        region: null,
        record_id: null,
    }

    ds.forEach(d => {
        if (d.region) {
            side.region = d.region.toLowerCase()
        }
        if (d.country) {
            side.country = d.country.toLowerCase()
        }
        if (d.locality) {
            side.locality = d.locality.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-")
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
        if (d.record_id) {
            side.record_id = d.record_id
        }
    })

    if (side.authority && side.dataset) {
        let result = `urn:covid:${side.authority}:${side.dataset}:${side.country||""}`
        if (side.region) {
            result += `-${side.region}`
        }
        if (side.locality) {
            result += `-${side.locality}`
        }
        if (side.date) {
            result += `:${side.date}`
        }
        if (side.record_id) {
            result += `:${side.record_id}`
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
