/*
 *  data/ns-covid/pull.js
 *
 *  David Janes
 *  IOTDB
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
const document = require("iotdb-document")

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
            
            $("#cases p").each((x, e) => {
                if (sd.json.date) {
                    return
                }

                const text = $(e).text()
                if (_.is.Empty(text)) {
                    return
                }

                let match
                match = text.match(/(\d+ (January|February|March|April|May|June|July|August|September)),*.([\d]+)/)
                if (match) {
                    const date = parse(`${match[1]} ${match[3]}`, "dd MMMM yyyy", new Date())
                    if (!_.is.Date(date)) {
                        return 
                    }

                    sd.json.date = date.toISOString().substring(0, 10)
                    return
                }

                match = text.match(/((January|February|March|April|May|June|July|August|September) \d+),*.(\d+)/)
                if (match) {
                    const date = parse(`${match[1]} ${match[3]}`, "MMMM dd yyyy", new Date())
                    if (!_.is.Date(date)) {
                        return 
                    }

                    sd.json.date = date.toISOString().substring(0, 10)
                    return
                }

            })

            $("#cases table").each((x, e) => {
                const table = _table($(e))
// console.log(table)

                table.forEach(row => {
                    if (!row.length === 2) {
                        return
                    }

                    if (_contains(row[0], "confirmed negative")) {
                        sd.json.tests_negative = _integer(row[1])
                    } else if (_contains(row[0], "Presumptive Positive")) {
                    } else if (_contains(row[0], "confirmed positive")) {
                        sd.json.tests_positive = _integer(row[1])
                    } else if (_contains(row[0], "negative")) {
                        sd.json.tests_negative = _integer(row[1])
                    } else if (_contains(row[0], "positive")) {
                        sd.json.tests_positive = _integer(row[1])
                    }
                })
            })

            if (_.is.Integer(sd.json.tests_positive) && _.is.Integer(sd.json.tests_negative)) {
                sd.json.tests = sd.json.tests_positive + sd.json.tests_negative
            }

// console.log(sd.json)
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
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

    _.promise()
        .then(fetch.document.get("https://novascotia.ca/coronavirus/"))
        .then(document.to.string)
        .then(_pull)
        .catch(error => {
            delete error.self
            console.log(error)
        })
        .except(_.error.log)
}
