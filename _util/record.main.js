/*
 *  _util/record.main.js
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
const record_main = (...ds) => {
    const _util = require(".")
    const result = {
        "@context": _util.context,
        "@id": null,
    }

    ds.forEach(d => {
        if (d.addressRegion) {
            result.state = d.addressRegion.toUpperCase()
        }
        if (d.addressCountry) {
            result.country = d.addressCountry.toUpperCase()
        }
        if (d.addressLocality) {
            result.locality = d.addressLocality
        }
    })

    result["@id"] = _util.record.urn(...ds)

    return result
}

/**
 *  API
 */
module.exports = record_main
