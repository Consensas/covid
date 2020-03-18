/*
 *  data/datasets/ca-icu.js
 *
 *  David Janes
 *  Consensas
 *  2020-03-15
 *  🔪🗡
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
const xlsx = require("iotdb-xlsx")

const path = require("path")

const FILE = path.join(__dirname, "ca-icu.csv")
const NAME = "ca-icu.yaml"

_.promise()
    .then(fs.read.utf8.p(FILE))
    .then(xlsx.load.csv)
    .make(sd => {
        sd.jsons
            .forEach(row => {
                _.keys(row)
                    .filter(key => key.startsWith("icu_"))
                    .forEach(key => {
                        const value = row[key]
                        if (_.is.String(value)) {
                            row[key] = _.coerce.to.Integer(value.replace(/,/g, ""))
                        }
                    })

                row.country = "CA"
                row.key = `CA-${row.state}`.toLowerCase()
                delete row.province

            })
        sd.json = sd.jsons
    })
    .then(fs.write.yaml.p(NAME, null))
    .except(_.error.log)
