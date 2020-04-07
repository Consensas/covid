/*
 *  data/us.covidtracking/cook.js
 *
 *  David Janes
 *  Consensas
 *  2020-03-23
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
const _util = require("../../_util")

const COUNTRY = "us"
const NAME = `${COUNTRY}-tests.yaml`

_.promise({
    settings: {
        authority: "covidtracking.com",
        dataset: "cases",
        country: "us",
    },
})
    .then(fs.list.p(path.join(__dirname, "raw", "us")))
    .each({
        method: fs.read.json.magic,
        inputs: "paths:path",
        outputs: "jsons",
        output_selector: sd => sd.json,
    })
    .make(sd => {
        const record = _util.record.main(sd.settings)
        record.items = sd.jsons.map(_item => {
            const date = `${_item.date}`.replace(/^(....)(..)(..)$/, "$1-$2-$3")
            const item = {
                "@id": `${record["@id"]}:${date}`,
                date: date,
                tests: _.d.first(_item, "total", null) || _.d.first(_item, "totalTestResults", null),
                tests_positive: _.d.first(_item, "positive", null),
                tests_negative: _.d.first(_item, "negative", null),
                tests_pending: _.d.first(_item, "pending", null),
                deaths: _.d.first(_item, "death", null),
                recovered: _.d.first(_item, "recovered", null),

                patients_hospital_current: _.d.first(_item, "hospitalizedCurrently"),
                patients_hospital_cumulative: _.d.first(_item, "hospitalizedCumulative"),
                patients_icu_current: _.d.first(_item, "inIcuCurrently"),
                patients_icu_cumulative: _.d.first(_item, "inIcuCumulative"),
                patients_venitlated_current: _.d.first(_item, "onVentilatorCurrently"),
                patients_venitlated_cumulative: _.d.first(_item, "onVentilatorCumulative"),
            }

            if (_.is.Nullish(item.tests) && item.tests_positive && item.tests_negative) {
                item.tests = item.tests_positive + item.tests_negative
            }
            
            return item
        })

        sd.json = record
        sd.path = path.join(__dirname, "cooked", _util.record.filename(sd.settings))
    })

    .then(fs.make.directory.parent)
    .then(fs.write.yaml)
    .log("wrote", "path")
    
    .except(_.error.log)
