/*
 *  data/pe-cmo/cook.js
 *
 *  David Janes
 *  Consensas
 *  2020-03-19
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

const NAME = "ca.timeline.yaml"

_.promise()
    .add("path", path.join(__dirname, "raw", "data.yaml"))
    .then(fs.read.json.magic)
    .make(sd => {
        const pdd = {}

        sd.json
            .filter(row => !_.is.Empty(row))
            .forEach(row => {
                const event = `event_${row.event}`

                _.keys(row)
                    .filter(province => province.length === 2)
                    .forEach(province => {
                        const value = row[province]
                        if (!value.match(/^20\d\d-\d\d-\d\d/)) {
                            return
                        }

                        pdd[province] = pdd[province] || {}
                        pdd[province][event] = value
                    })
            })
        
        sd.json = []

        _.keys(pdd)
            .forEach(province => {
                sd.json.push(Object.assign(
                    {
                        country: "CA",
                        state: province.toUpperCase(),
                        key: `ca-${province}`.toLowerCase(),
                    },
                    pdd[province],
                ))
            })
    })
    .then(fs.write.yaml.p(NAME, null))
    .except(_.error.log)
