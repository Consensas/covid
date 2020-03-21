/*
 *  data/on-cmo/cook.js
 *
 *  David Janes
 *  Consensas
 *  2020-03-16
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
const PROVINCE = "on"
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
            country: COUNTRY.toUpperCase(),
            state: PROVINCE.toUpperCase(),
            key: `${COUNTRY}-${PROVINCE}`.toLowerCase(),
            items: [],
        }

        sd.jsons
            .filter(json => json.date && json.status)
            .forEach(json => {
                const item = {
                    date: json.date,
                }

                // console.log(json.status)
                // process.exit()
                
                json.status.forEach(tuple => {
                    const number = _.coerce.to.Integer(tuple[1].replace(/,/g, ""), null)
                    if (tuple[0].startsWith("Total number")) {
                        item.tests_ordered = number
                    } else if (tuple[0].startsWith("Confirmed neg") || tuple[0].startsWith("Neg")) {
                        item.tests_negative = number
                    } else if (tuple[0].startsWith("Presumptive neg")) {
                        // item.tests_xxx = number
                    } else if (tuple[0].startsWith("Confirmed p") || tuple[0].startsWith("Pos")) {
                        item.tests_positive = number
                    } else if (tuple[0].startsWith("Presumptive p")) {
                        // item.tests_xxx = number
                    } else if (tuple[0].startsWith("Resolved")) {
                        item.tests_resolved = number
                    }
                })

                item.tests = (item.tests_negative || 0) + (item.tests_positive || 0) + (item.tests_resolved || 0) 

                sd.json.items.push(item)
            })

        sd.json = [ sd.json ]
    })
    .then(fs.write.yaml.p(NAME, null))
    .except(_.error.log)
