/*
 *  data/sk-cmo/pull.js
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

const path = require("path")
const cheerio = require("cheerio")
const parse = require("date-fns/parse")

const _util = require("../../_util")

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
const PROVINCE = "sk"

/**
 */
const _pull = _.promise((self, done) => {
    _.promise(self)
        .validate(_pull)
        .make(sd => {
            sd.json = {
                date: null,
            }

            const $ = cheerio.load(self.document)

            const _table = $n => {
                const rows = []
                $n.find("tr").each((x, etr) => {
                    const row = []
                    $(etr).find("td,th").each((y, etd) => {
                        row.push($(etd).text())
                    })
                    if (row.length) {
                        rows.push(row)
                    }
                })
                return rows
            }

            const _integer = x => _.coerce.to.Integer(x.replace(/,/g, ""), null)
            const _contains = (a, b) => (a || "").toLowerCase().indexOf(b.toLowerCase()) > -1
            
            const text = $.text()
            const tests_match = text.match(/([\d,]+) COVID-19 tests/)
            if (tests_match) {
                sd.json.tests = _integer(tests_match[1])
            }

            let match
            if (match = text.match(/SUMMARY . ([A-Za-z]+ \d+, 20\d\d)/)) {
                const date = parse(`${match[1]}`, "MMMM dd, yyyy", new Date())
                if (!_.is.Date(date)) {
                    return 
                }

                sd.json.date = date.toISOString().substring(0, 10)
            }
            if (match = text.match(/[(]as of ([A-Za-z]+ \d+, 20\d\d)[)]/)) {
                const date = parse(`${match[1]}`, "MMMM dd, yyyy", new Date())
                if (!_.is.Date(date)) {
                    return 
                }

                sd.json.date = date.toISOString().substring(0, 10)
            }

            $("table.compacttable").each((x, e) => {
                const table = _util.normalize.object(_util.cheerio.table($, $(e)))
                if (table.length < 2) {
                    return
                }

                if (_.is.Equal(table[0], [
                    'region',
                    'of patients with tests ordered',
                    'of patients with tests pending',
                    'patients presumptive postive',
                    'patients confirmed postive',
                    'patients confirmed negative',
                    'total of tests performed'
                ])) {
                    const row = table[table.length - 1]
                    sd.json.tests_ordered = row[1]
                    sd.json.tests_pending = row[2]
                    sd.json.tests_probable = row[3]
                    sd.json.tests_positive = row[4]
                    sd.json.tests_negative = row[5]
                    sd.json.tests = row[6]
                } else {
                    table
                        .filter(row => row.length === 5)
                        .filter(row => row[0] === 'total saskatchewan')
                        .forEach(row => {
                            sd.json.tests_positive = row[2]
                            sd.json.tests_probable = row[3]
                        })

                    if (sd.json.tests && sd.json.tests_positive) {
                        sd.json.tests_negative = sd.json.tests - sd.json.tests_positive - (sd.json.tests_probable || 0)
                    }
                }
            })

            sd.path = path.join(__dirname, "raw", `${sd.json.date}.yaml`)

            if (_.is.Empty(sd.json.date)) {
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
        .then(fetch.document.get("https://www.saskatchewan.ca/government/health-care-administration-and-provider-resources/treatment-procedures-and-guidelines/emerging-public-health-issues/2019-novel-coronavirus/cases-and-risk-of-covid-19-in-saskatchewan"))
        .then(_pull)
        .except(_.error.log)
}
