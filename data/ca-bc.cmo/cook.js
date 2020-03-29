/*
 *  data/bc-cmo/cook.js
 *
 *  David Janes
 *  Consensas
 *  2020-03-17
 *  ☘️
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
const fs = require("iotdb-fs")

const path = require("path")

const COUNTRY = "ca"
const PROVINCE = "bc"
const NAME = `${COUNTRY}-${PROVINCE}-tests.yaml`

_.promise()
    .then(fs.list.p(path.join(__dirname, "raw")))
    .each({
        method: fs.read.json.magic,
        inputs: "paths:path",
        outputs: "jsons",
        output_selector: sd => sd.json,
    })
    .make(sd => {
        sd.json = {
            "@context": "https://consensas.world/m/covid",
            "@id": `urn:covid:consensas:${COUNTRY}-${PROVINCE}:cmo`,
            country: COUNTRY.toUpperCase(),
            region: PROVINCE.toUpperCase(),
            key: `${COUNTRY}-${PROVINCE}`.toLowerCase(),
            items: [],
        }

        sd.jsons
            .filter(json => json.date)
            .forEach(json => {
                const item = {
                    "@id": `urn:covid:consensas:${COUNTRY}-${PROVINCE}:${json.date}`,
                    date: json.date,
                }

                if (json.value) {
                    item.tests = json.value
                }
                if (json.tests) {
                    item.tests = json.tests
                }
                if (json.confirmed) {
                    item.tests_positive = json.confirmed
                }
                if (json.tests_positive) {
                    item.tests_positive = json.tests_positive 
                }
                if (item.tests && item.tests_positive) {
                    item.tests_negative = item.tests - item.tests_positive
                }

                sd.json.items.push(item)
            })

        sd.json = [ sd.json ]
    })

    .add("path", path.join(__dirname, NAME))
    .then(fs.write.yaml)
    .log("wrote", "path")

    .except(_.error.log)
