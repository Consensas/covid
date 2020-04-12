/*
 *  data/ca.cmo/cook.js
 *
 *  David Janes
 *  Consensas
 *  2020-03-29
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

const _util = require("../../_util")

const path = require("path")

const mapping = {
    "Alberta": "AB",
    "British Columbia": "BC",
    "Canada": "",
    "Manitoba": "MB",
    "New Brunswick": "NB",
    "Newfoundland and Labrador": "NL",
    "Northwest Territories": "NT",
    "Nova Scotia": "NS",
    "Nunavut": "NU",
    "Ontario": "ON",
    "Prince Edward Island": "PE",
    "Quebec": "QC",
    "Repatriated Travellers": "XXTR",
    "Repatriated travellers": "XXTR",
    "Saskatchewan": "SK",
    "Yukon": "YK",
}

/**
 *  The number of tests performed is scraped
 */
const _read_tests = _.promise((self, done) => {
    _.promise(self)
        .validate(_read_tests)

        .add({
            path: path.join(__dirname, "raw"),
            fs$filter_name: name => name.match(/^[\d-]+[.]yaml$/)
        })
        .then(fs.make.directory)
        .then(fs.list)
        .each({
            method: fs.read.json.magic,
            inputs: "paths:path",
            outputs: "jsons",
            output_selector: sd => sd.json,
        })
        .make(sd => {
            sd.testd = {}
            sd.jsons
                .filter(json => json.date && json.tables && json.tables.length)
                .forEach(json => {
                    let tests = -1

                    json.tables 
                        .filter(table => table[0][0].indexOf("province") === -1)
                        .forEach(table => {
                            let testx = -1
                            const header = table.shift()
                            if (_.is.Equal(header, [
                                'total number of patients tested in canada',
                                'total positive',
                                'total negative' ])) {
                                testx = 0
                            } else if (_.is.Equal(header, [ 'negative', 'positive', 'total' ])) {
                            }

                            table.forEach(row => {
                                if ((tests === -1) && (testx !== -1) && _.is.Integer(row[testx])) {
                                    tests = row[testx]
                                }
                            })
                        })

                    if (tests !== -1) {
                        sd.testd[json.date] = tests
                    }
                })
        })

        .end(done, self, _read_tests)
})

_read_tests.method = "_read_tests"
_read_tests.description = ``
_read_tests.requires = {
}
_read_tests.accepts = {
}
_read_tests.produces = {
    testd: _.is.Dictionary,
}

/**
 */
const _one = _.promise((self, done) => {
    _.promise(self)
        .validate(_one)
        .make(sd => {
            const PROVINCE = sd.items[0].region ? sd.items[0].region : null

            sd.json = _util.record.main(sd.settings, {
                region: PROVINCE,
            })
            sd.json.items = []
            sd.path = path.join(__dirname, "cooked", _util.record.filename(sd.settings, {
                region: PROVINCE,
            }))

            sd.items
                .filter(item => item.date)
                .forEach(_item => {
                    const item = {}
                    item["@id"] = _util.record.urn(sd.settings, {
                        region: PROVINCE,
                        date: _item.date,
                    })

                    _.mapObject(_item, (value, key) => {
                        if (_.is.Integer(value) || (key === "date")) {
                            item[key] = _item[key]
                        }
                    })

                    // we have total number
                    if (_.is.Nullish(PROVINCE) && sd.testd[item.date]) {
                        item.tests = sd.testd[item.date]
                    }

                    sd.json.items.push(item)
                })

            sd.json = [ sd.json ]
        })

        .then(fs.write.yaml)
        .log("wrote", "path")

        .end(done, self, _one)
})

_one.method = "_one"
_one.description = ``
_one.requires = {
    items: _.is.Array.of.Dictionary,
}
_one.accepts = {
}
_one.produces = {
}

_.promise()
    .add("path", path.join(__dirname, "settings.yaml"))
    .then(fs.read.yaml)
    .add("json:settings")

    .then(_read_tests)

    .then(fs.read.yaml.p(path.join(__dirname, "raw", "data.yaml")))
    .make(sd => {
        const rsd = {}

        sd.json
            .map(record => ({
                region: mapping[record.prname] || null,
                date: (d => `${d.substring(6, 10)}-${d.substring(3, 5)}-${d.substring(0, 2)}`)(record.date),
                tests: _util.normalize.integer(record.numtested, null),
                tests_positive: _util.normalize.integer(record.numconf, null),
                tests_probable: _util.normalize.integer(record.numprob, null),
                deaths: _util.normalize.integer(record.numdeaths, null),
                recovered: _util.normalize.integer(record.numrecover, null),
            }))
            .forEach(record => {
                record = _.d.transform.denull(record)
                rsd[record.region] = rsd[record.region] || []
                rsd[record.region].push(record)
            })

        sd.rss = _.values(rsd)
    })
    .each({
        method: _one,
        inputs: "rss:items",
    })
    
    .except(_.error.log)
