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

const _oki = _.is.Integer

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

        const record = _util.record.main(sd.settings)
        record.items = items.map(_item => {
            const item = {
                "@id": _util.record.urn(sd.settings, { date: _item.reported_date }),
                date: _item.reported_date,
                deaths: _util.normalize.integer(_item.deaths, null),
                recovered: _util.normalize.integer(_item.resolved, null),
                tests: null,
                tests_positive: _util.normalize.integer(_item.total_cases, null),
                tests_negative: null,
                tests_confirmed: _util.normalize.integer(_item.confirmed_positive, null),
                tests_probable: null,
                tests_pending: _util.normalize.integer(_item.under_investigation, null),
                tests_approved: _util.normalize.integer(_item.total_patients_approved_for_testing_as_of_reporting_date, null),

                patients_hospital_current: _.d.first(_item, "number_of_patients_hospitalized_with_covid_19", null),
                patients_icu_current: _.d.first(_item, "number_of_patients_in_icu_with_covid_19", null),
                patients_ventilated_current: _.d.first(_item, "number_of_patients_in_icu_on_a_ventilator_with_covid_19", null),
            }

            if (!_oki(item.tests) && _oki(item.tests_approved) && _oki(item.tests_pending)) {
                item.tests = item.tests_approved - item.tests_pending
            }
            if (!_oki(item.tests) && _oki(item.tests_negative) && _oki(item.tests_positive)) {
                item.tests = item.tests_negative + item.tests_positive
            }
            if (!_oki(item.tests_pending) && _oki(item.tests_positive) && _oki(item.tests_confirmed)) {
                item.tests_pending = item.tests_positive - item.tests_confirmed
            }
            if (!_oki(item.tests_negative) && _oki(item.tests_positive) && _oki(item.tests)) {
                item.tests_negative = item.tests - item.tests_positive
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
