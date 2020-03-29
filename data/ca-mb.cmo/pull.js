/*
 *  data/mb-cmo/pull.js
 *
 *  David Janes
 *  Consensas
 *  2020-03-17
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
const PROVINCE = "mb"

/**
 */
const _pull = _.promise((self, done) => {
    _.promise(self)
        .validate(_pull)
        .make(sd => {
            const item = {}

            const $ = cheerio.load(self.document)

            $("table").each((x, e) => {
                const table = _util.normalize.object(_util.cheerio.table($, $(e)))
                if (ad.verbose) {
                    console.log("-", "verbose", table)
                }

                if (_.is.Equal(table[0], [ 'regions', 'total cases', 'confirmed positive', 'probable positive', 'deaths' ])) {
                    const row = table.find(row => row[0] === "totals")
                    if (!row) {
                        return
                    }

                    item.tests_positive = row[2]
                    item.tests_probable = row[3]
                    item.deaths = row[4]
                } else {
                    table.forEach(row => {
                        if (row[0].startsWith("confirmed pos")) {
                            item.tests_positive = row[1]
                        }
                        if (row[0].startsWith("probable pos")) {
                            item.tests_probable = row[1]
                        }
                    })
                }
            })

            $("p").each((x, e) => {
                const text = $(e).text().trim()
                if (_.is.Empty(text)) {
                    return
                }

                let match = text.match(/^As.*((January|February|March|April|May|June|July|August|September) \d+), ([\d,]+) test/)
                if (!match) {
                    return
                }

                const date = parse(`${match[1]} 2020`, "MMMM dd yyyy", new Date())
                if (!_.is.Date(date)) {
                    return 
                }

                const value = _.coerce.to.Integer(match[3].replace(/,/g, ""), null)
                if (!value) {
                    return
                }

                item.tests = value
                item.date = date.toISOString().substring(0, 10)
            })

            if (!item.date || (_.size(item) < 2)) {
                console.log("#", "no data for", COUNTRY, PROVINCE, item)
                _.promise.bail(sd)
            }

            if (ad.verbose) {
                console.log("-", "item", item)
            }

            sd.json = item
            sd.path = path.join(__dirname, "raw", `${sd.json.date}.yaml`)
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
        .then(fetch.document.get("http://www.manitoba.ca/covid19/"))
        .then(_pull)
        .except(_.error.log)
}
