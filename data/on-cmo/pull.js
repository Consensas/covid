/*
 *  data/ontario-covid/pull.js
 *
 *  David Janes
 *  IOTDB
 *  2020-03-16
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
            sd.result = {
                cases: null,
                status: null,
                date: null,
            }

            const $ = cheerio.load(self.document)

            const _table = $n => {
                const rows = []
                $n.find("tr").each((x, etr) => {
                    const row = []
                    $(etr).find("td").each((y, etd) => {
                        row.push($(etd).text())
                    })
                    if (row.length) {
                        rows.push(row)
                    }
                })
                return rows
            }

            const _date = text => {
                const parse = require("date-fns/parse")

                const match = text.match(/Last updated: ([A-Z][a-z]+ \d+, \d+)/)
                if (!match) {
                    return null
                }

                const date = parse(match[1], "MMMM dd, yyyy", new Date())
                if (!_.is.Date(date)) {
                    return null
                }

                return date.toISOString().substring(0, 10)
            }

            $("#pagebody").each((x, e) => {
                let state = "start"

                e.childNodes.forEach(n => {
                    const $n = $(n)
                    switch (n.tagName) {
                    case "p":
                        if (state === "status") {
                            const text = $n.text()
                            if (text.startsWith("Last updated:")) {
                                sd.result.date = _date(text)
                            }
                        }
                        break

                    case "table":
                        sd.result[state] = _table($n)
                        break
                        
                    case "h2":
                    case "h3":
                        if ($n.text() === "Status of cases in Ontario") {
                            state = "status"
                        } else if ($n.text() === "New confirmed positive cases") {
                            state = "cases"
                        } else {
                            state = "unknown"
                        }
                        break
                    }
                })
            })

            sd.path = path.join(__dirname, "raw", `${sd.result.date}.yaml`)
            sd.json = sd.result
        })
        .then(fs.make.directory.parent)
        .then(fs.write.yaml)

        .end(done, self, _pull)
})

_pull.method = "_pull"
_pull.description = ``
_pull.requires = {
}
_pull.accepts = {
}
_pull.produces = {
    result: _.is.Dictionary,
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
        .then(fetch.json.get("https://api.ontario.ca/api/drupal/page%2F2019-novel-coronavirus?fields=body"))
        .make(sd => {
            sd.document = "<div id='pagebody'>" + sd.json.body.und[0].safe_value + "</div>"
        })
        .then(_pull)
        .except(_.error.log)
}


/*
const FILE = path.join(__dirname, "ca-age.csv")
const NAME = "ca-age.yaml"

_.promise()
    .then(fs.read.utf8.p(FILE))
    .then(fs.write.yaml.p(NAME, null))
    .except(_.error.log)
*/
