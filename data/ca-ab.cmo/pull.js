/*
 *  data/ab-cmo/pull.js
 *
 *  David Janes
 *  Consensas
 *  2020-03-17
 *  ☘️
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
const fetch = require("iotdb-fetch")

const _util = require("../../_util")

const path = require("path")
const cheerio = require("cheerio")
const parse = require("date-fns/parse")

const minimist = require("minimist")
const ad = minimist(process.argv.slice(2), {
    boolean: [
    ],
    string: [
    ],
    alias: {
    },
})

const COUNTRY = "ca"
const PROVINCE = "ab"

/**
 */
const _pull = _.promise((self, done) => {
    _.promise(self)
        .validate(_pull)
        .make(sd => {
            let match

            sd.json = {
                date: null,
            }

            const $ = cheerio.load(self.document)

            $("table").each((x, e) => {
                const table = _util.normalize.object(_util.cheerio.table($, $(e)))
                if (table.length < 2) {
                    return
                }

                if (ad.verbose) {
                    console.log("-", table)
                }

                if (_.is.Equal(table[0], [ "test results" ])) {

                    table.forEach(row => {
                        if (match = row[0].match(/as of ([A-Za-z]* \d+)/)) {
                            const date = parse(`${match[1]} 2020`, "MMMM dd yyyy", new Date())
                            if (!_.is.Date(date)) {
                                return 
                            }

                            sd.json.date = date.toISOString().substring(0, 10)
                        }
                    })

                    table.forEach(row => {
                        if (row[0].startsWith("completed tests")) {
                            sd.json.tests = row[1]
                        }
                    })

                    table[0].forEach((column, x) => {
                        if (column.startsWith("pos")) {
                            sd.json.tests_positive = table[1][x]
                        } else if (column.startsWith("neg")) {
                            sd.json.tests_negative = table[1][x]
                        }
                    })

                    if (_.is.Integer(sd.json.tests_positive) && _.is.Integer(sd.json.tests_negative) && !sd.json.tests) {
                        sd.json.tests = sd.json.tests_positive + sd.json.tests_negative
                    }
                } else if (_.is.Equal(table[0], [ 'location', 'confirmed cases', 'deaths' ])) { 
                    table.forEach(row => {
                        if (row[0] === "in alberta") {
                            sd.json.tests_positive = row[1]
                            sd.json.deaths = row[2]
                        }
                    })
                } else if (_.is.Equal(table[0], [ 'location', 'confirmed cases', 'deaths', 'recoverd cases', 'completed tests' ])) {
                    table.forEach(row => {
                        if (row[0] === "in alberta") {
                            sd.json.tests_positive = row[1]
                            sd.json.deaths = row[2]
                            sd.json.recovered = row[3]
                            sd.json.tests = row[4]
                        }
                    })
                } else if (_.is.Equal(table[0], [ 'location', 'confirmed cases', 'deaths', 'recovered cases', 'completed tests' ])) {
                    table.forEach(row => {
                        if (row[0] === "in alberta") {
                            sd.json.tests_positive = row[1]
                            sd.json.deaths = row[2]
                            sd.json.recovered = row[3]
                            sd.json.tests = row[4]
                        }
                    })
                } else if (_.is.Equal(table[0], [ 'location', 'confirmed cases', 'active cases', 'recovered cases', 'in hospital', 'in intensive care', 'deaths', 'tests completed' ])) {
                    table.forEach(row => {
                        if (row[0] === "in alberta") {
                            sd.json.tests_positive = row[1]
                            sd.json.recovered = row[3]
                            sd.json.patients_hospital_current = row[4]
                            sd.json.patients_icu_current = row[5]
                            sd.json.deaths = row[6]
                            sd.json.tests = row[7]
                        }
                    })
                } else if (ad.verbose) {
                    console.log(table[0])
                }
            }) 

            if (!_.is.Empty(sd.json) && !sd.json.date) {
                $("meta[name='published']").each((x, e) => {
                    if (e.attribs.content) {
                        sd.json.date = new Date(e.attribs.content).toISOString().substring(0, 10)
                    }
                })
            }

            if (ad.verbose) {
                console.log("-", "json", sd.json)
            }

            sd.path = path.join(__dirname, "raw", `${sd.json.date}.yaml`)

            if (_.size(sd.json) < 2) {
                console.log("#", "no data for", COUNTRY, PROVINCE)
                _.promise.bail(sd)
            }
        })
        .then(fs.make.directory.parent)
        .then(fs.write.yaml)
        .log("wrote", "path")

        .end(done, self, _pull)
})

_pull.method = "_pull"
_pull.description = ``
_pull.requires = {
}
_pull.accepts = {
}
_pull.produces = {
}


if (ad._.length) {
    _.promise({
        paths: ad._,
    })
        .each({
            method: fs.read.utf8,
            inputs: "paths:path",
            outputs: "documents",
            output_selector: sd => sd.document,
            error: error => {
                console.log("#", _.error.message(error))
            },
        })
        .each({
            method: _pull,
            inputs: "documents:document",
        })
        .except(_.error.log)
} else {
    _.promise()
        // .then(fetch.document.get("https://www.alberta.ca/coronavirus-info-for-albertans.aspx"))
        .then(fetch.document.get("https://www.alberta.ca/covid-19-alberta-data.aspx"))
        .then(_pull)
        .except(_.error.log)
}
