/*
 *  data/nl-cmo/cook.js
 *
 *  David Janes
 *  Consensas
 *  2020-03-22
 *
 *  Copyright (2013-2020) Consenas
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
const _util = require("../../_util")

_.promise({
    settings: {
        authority: "consensas",
        dataset: "cmo",
        region: "nl",
        country: "ca",
    },
})
    /*
    .then(fs.read.yaml.p(path.join(__dirname, "manual.yaml")))
    .make(sd => {
        const record = _util.record.main(sd.settings)
        record.items = sd.json

        sd.json = [ record ]
        sd.path = path.join(__dirname, "cooked", _util.record.filename(sd.settings))
    })
    */
    // scraped data
    .then(fs.list.p(path.join(__dirname, "raw")))
    .each({
        method: fs.read.json.magic,
        inputs: "paths:path",
        outputs: "jsons",
        output_selector: sd => ({
            date: sd.json.date,
            tests_positive: sd.json.total_cases_max || null,
            deaths: sd.json.total_deaths_max || null,
            recovered: sd.json.total_recovered_max || null,
            tests: sd.json.total_tests_delivered_max || null,
            patients_hospital_current: sd.json.currently_hospitalized_max || null,
            patients_icu_current: sd.json.currently_in_icu_max || null,
        }),
    })

    // manual data
    .then(fs.read.yaml.p(path.join(__dirname, "manual.yaml")))
    .make(sd => {
        const d = {};
        [].concat(sd.jsons, sd.json)
            .filter(item => item.date)
            .forEach(item => {
                d[item.date] = Object.assign({ "@id": null, }, d[item.date] || {}, item)
            })

        sd.items = _.values(d)
        sd.items.sort((a, b) => _.is.unsorted(a.date, b.date))
    })

    .make(sd => {
        const record = _util.record.main(sd.settings)
        record.items = sd.items

        record.items.forEach(item => {
            item["@id"] = `${record["@id"]}:${item.date}`

            if (!_.is.Integer(item.tests_negative) && _.is.Integer(item.tests_positive) && _.is.Integer(item.tests)) {
                item.tests_negative = item.tests - item.tests_positive
            }
        })

        sd.json = [ record ]
        sd.path = path.join(__dirname, "cooked", _util.record.filename(sd.settings))
    })

    .then(fs.make.directory.parent)
    .then(fs.write.yaml)
    .log("wrote", "path")

    .except(_.error.log)
