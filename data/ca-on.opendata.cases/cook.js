/*
 *  data/ca-on.opendata.cases/cases.js
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

/**
 */
const _cook_row = _.promise(self => {
    _.promise.validate(self, _cook_row)

    self.item = _util.record.main(self.settings, { 
        record_id: `${self.row.case_number}`.padStart(6, '0'),
    })

    self.item.dataset_id = self.row.case_number

    self.item.gender = (value => {
        switch (value.toLowerCase()) {
        case "female": return "Female";
        case "male": return "Male";
        case "not reported": return null;
        default:
            console.log("#", "covid/data/ca-on.opendata.cases/cook", "unknown gender:", value)
            process.exit(1)
        }
    })(self.row.patient_gender);

    self.item.age = (value => {
        let match

        if (_.is.Empty(value)) {
            return null
        } else if (value === "not reported") {
            return null
        }

        match = value.match(/^(\d)(\d)s$/)
        if (match) {
            return `${match[1]}${match[2]}-${match[1]}9`
        }

        match = value.match(/^[<](\d+)/)
        if (match) {
            return `0-${match[1]}`
        }

        console.log("#", "covid/data/ca-on.opendata.cases/cook", "unknown age:", value)
        process.exit(1)
    })(self.row.patient_age);

    (value => {
        const parts = value.toLowerCase().split(";")
        parts.forEach(part => {
            switch (part.trim()) {
            case "travel":
                self.item.acquired_travel = true
                break
            case "not reported":
                break
            case "close contact": 
                self.item.acquired_close_contact = true
                break
            default:
                console.log("#", "covid/data/ca-on.opendata.cases/cook", "unknown transmission:", value)
                process.exit(1)
            }
        })
    })(self.row.transmission);

    self.item.status = (value => {
        switch (value.toLowerCase()) {
        case "ltch":
        case "institution":
        case "self-isolating":
        case "isolation":
            return value
        case "isolation in nursing home":
            return "nursing-home"
        case "deceased":
            self.is_dead = true
            return "death"
        case "hospitalized":
            return "hospital"
        case "not reported":
            return null

        default:
            console.log("#", "covid/data/ca-on.opendata.cases/cook", "unknown status:", value)
            process.exit(1)
        }
    })(self.row.status);


    if (self.row.travel_location) {
        console.log(self.row.travel_location)
    }

    
    /*

    
    travel_location: 'USA',
    reporting_unit: 'Halton Region Health Department',
    */
    
})

_cook_row.method = "_cook_row"
_cook_row.description = ``
_cook_row.requires = {
    row: _.is.Dictionary,
    settings: _.is.Dictionary,
}
_cook_row.accepts = {
}
_cook_row.produces = {
}

/**
 */
const _cook_health_unit = _.promise((self, done) => {
    _.promise.validate(self, _cook_health_unit)
})

_cook_health_unit.method = "_cook_health_unit"
_cook_health_unit.description = ``
_cook_health_unit.requires = {
    row: _.is.Dictionary,
}
_cook_health_unit.accepts = {
}
_cook_health_unit.produces = {
}

_.promise()
    // load settings
    .add("path", path.join(__dirname, "settings.yaml"))
    .then(fs.read.yaml)
    .add("json:settings")

    // load data
    .add("path", path.join(__dirname, "raw", "cases.yaml"))
    .then(fs.read.yaml)

    .each({
        method: _cook_row,
        inputs: "json:row",
        outputs: "item",
        output_selector: sd => sd.item,
    })
    .each({
        method: _cook_row,
        inputs: "json:row",
    })

            /*
    // cook
    .make(sd => {
        const raws = sd.json

        sd.records = raws.map(raw => {
            const record = _util.record.main(sd.settings, { 
                record_id: `${raw.case_number}`.padStart(6, '0'),
    case_number: 99,
    patient_age: '50s',
    patient_gender: 'female',
    transmission: 'travel',
    travel_location: 'USA',
    status: 'self-isolating',
    reporting_unit: 'Halton Region Health Department',
    health_unit_address: '1151 Bronte Road',
    health_unit_city: 'Oakville',
    health_unit_postal_code: 'L6M 3Ll',
    health_unit_website: 'www.halton.ca/For-Residents/Public-Health/',
    health_unit_latitude: 43.41399692,
    health_unit_longitude: -79.74479581 },
            })


            return record
        })

        console.log(sd.records)

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

  { reported_date: '2020-03-14',
    case_number: 99,
    patient_age: '50s',
    patient_gender: 'female',
    transmission: 'travel',
    travel_location: 'USA',
    status: 'self-isolating',
    reporting_unit: 'Halton Region Health Department',
    health_unit_address: '1151 Bronte Road',
    health_unit_city: 'Oakville',
    health_unit_postal_code: 'L6M 3Ll',
    health_unit_website: 'www.halton.ca/For-Residents/Public-Health/',
    health_unit_latitude: 43.41399692,
    health_unit_longitude: -79.74479581 },


        sd.path = path.join(__dirname, "cooked", _util.record.filename(sd.settings, "-cases"))
    })

    .then(fs.make.directory.parent)
    .then(fs.write.yaml)
    .log("wrote", "path")
 */

    .except(_.error.log)
