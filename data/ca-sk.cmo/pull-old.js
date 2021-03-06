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

const minimist = require("minimist")
const ad = minimist(process.argv.slice(2), {
    boolean: [
    ],
    string: [
    ],
    alias: {
    },
})

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
            
            $("meta[name='published']").each((x, e) => {
                if (e.attribs.content) {
                    sd.json.date = new Date(e.attribs.content).toISOString().substring(0, 10)
                }
            })

            // the old way
            $("table.compacttable").each((x, e) => {
                const table = _table($(e))
                if (table.length < 2) {
                    return
                }

                console.log(table)

                table.forEach(row => {
                    const match = row[0].match(/as of ([A-Za-z]* \d+, \d+)/)
                    if (match) {
                        const date = parse(`${match[1]}`, "MMMM dd, yyyy", new Date())
                        if (!_.is.Date(date)) {
                            return 
                        }

                        sd.json.date = date.toISOString().substring(0, 10)
                    }

                    if (!row.length === 2) {
                        return
                    }

                    if (_contains(row[0], "total persons")) {
                        sd.json.tests = _integer(row[1])
                    } else if (_contains(row[0], "tests performed")) {
                        sd.json.tests = _integer(row[1])
                    } else if (_contains(row[0], "pending results")) {
                        sd.json.tests_pending = _integer(row[1])
                    } else if (_contains(row[0], "confirmed negative")) {
                        sd.json.tests_negative = _integer(row[1])
                    } else if (_contains(row[0], "confirmed positive")) {
                        sd.json.tests_positive = _integer(row[1])
                    }
                })
            })

            sd.path = path.join(__dirname, "raw", `${sd.json.date}.yaml`)

            if (_.is.Empty(sd.json.date)) {
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
        .then(fetch.document.get("https://www.saskatchewan.ca/government/health-care-administration-and-provider-resources/treatment-procedures-and-guidelines/emerging-public-health-issues/2019-novel-coronavirus"))
        .then(fetch.document.get("https://www.saskatchewan.ca/government/health-care-administration-and-provider-resources/treatment-procedures-and-guidelines/emerging-public-health-issues/2019-novel-coronavirus/cases-and-risk-of-covid-19-in-saskatchewan"))
        .then(_pull)
        .except(_.error.log)
}
