/*
 *  data/datasets/ca-age.js
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
 *
 *  DATA SOURCE
 *  https://www.cma.ca/sites/default/files/pdf/Physician%20Data/12-Phys_per_pop.pdf
 */

"use strict"

const _ = require("iotdb-helpers")
const fs = require("iotdb-fs")
const xlsx = require("iotdb-xlsx")

const path = require("path")

const FILE = path.join(__dirname, "ca-age.csv")
const NAME = "ca-age.yaml"

_.promise()
    .then(fs.read.utf8.p(FILE))
    .then(xlsx.load.csv)
    .make(sd => {
        const pd = {}

        sd.jsons
            .filter(row => row.age)
            .forEach(row => {
                let key
                let match

                match = row.age.match(/^(\d+) to (\d+) years$/)
                if (match) {
                    key = `age_${match[1]}_${match[2]}`
                }

                match = row.age.match(/^(\d+) years and over/)
                if (match) {
                    key = `age_${match[1]}_up`
                }

                if (row.age === "All ages") {
                    key = "population"
                } else if (row.age === "Median age") {
                    key = "age_median"
                } else if (row.age === "Age group3 5") {
                    return
                }

                _.keys(row)
                    .filter(key => key.length === 2)
                    .forEach(province => {
                        pd[province] = pd[province] || {
                            country: "CA",
                            state: province.toUpperCase(),
                            key: `CA-${province}`.toLowerCase(),
                        }

                        const value = row[province]
                        if (_.is.Number(value)) {
                            pd[province][key] = value
                        } else if (_.is.String(value)) {
                            pd[province][key] = _.coerce.to.Integer(value.replace(/,/g, ""), null)
                        } else {
                            pd[province][key] = null
                        }
                    })
            })

        sd.json = _.values(pd)
    })
    .then(fs.write.yaml.p(NAME, null))
    .except(_.error.log)
