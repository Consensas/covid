/*
 *  data/ca-on.opendata.tests/cook.js
 *
 *  David Janes
 *  Consensas
 *  2020-03-25
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

const COUNTRY = "ca"
const PROVINCE = "nl"
const NAME = `${COUNTRY}-${PROVINCE}-tests.yaml`

_.promise()
    // load settings
    .add("path", path.join(__dirname, "settings.yaml"))
    .then(fs.read.yaml)
    .add("json:settings")

    // load data
    .add("path", path.join(__dirname, "raw", "tests.yaml"))
    .then(fs.read.yaml)

    // cook
    .make(sd => {
        const items = sd.json
        // console.log(sd.json)

        sd.json = _util.record.main(sd.settings)
        sd.json.items = items.map(item => ({
            "@id": _util.record.urn(sd.settings, { date: item.reported_date }),
            date: item.reported_date,
            tests_negative: _.coerce.to.Integer(item.confirmed_negative, null),
            tests_investigation: _.coerce.to.Integer(item.under_investigation, null),
            tests_positive: _.coerce.to.Integer(item.confirmed_positive, null),
            tests_resolved: _.coerce.to.Integer(item.resolved, null),
            tests_deaths: _.coerce.to.Integer(item.deaths, null),
            tests_approved: _.coerce.to.Integer(item.total_patients_approved_for_testing_as_of_reporting_date, null),
        }))

        sd.path = path.join(__dirname, "cooked", _util.record.filename(sd.settings))
    })

    .then(fs.make.directory.parent)
    .then(fs.write.yaml)
    .log("wrote", "path")

    .except(_.error.log)
