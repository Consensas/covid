/*
 *  data/on-cmo/pull.js
 *
 *  David Janes
 *  Consensas
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

console.log("discontinued")
process.exit()

"use strict"

const _ = require("iotdb-helpers")
const fs = require("iotdb-fs")
const fetch = require("iotdb-fetch")

const path = require("path")
const cheerio = require("cheerio")
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
const PROVINCE = "on"

/**
 */
const _pull = _.promise((self, done) => {
    _.promise(self)
        .validate(_pull)
        .make(sd => {
            const item = {}

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

                const date = parse(text, "MMMM dd yyyy", new Date())
                if (!_.is.Date(date)) {
                    return null
                }

                return date.toISOString().substring(0, 10)
            }

            $("#pagebody").each((x, e) => {
                let state = "start"
                let match

                e.childNodes.forEach(n => {
                    const $n = $(n)
                    const text$ = _util.normalize.text($n.text())

                    switch (n.tagName) {
                    case "p":
                        if (state === "status") {
                            if (match = text$.match(/epidemiologic summa.*to ([a-z]+ \d+ 202\d)/)) {
                                item.date = _date(match[1])
                            } else if (match = text$.match(/last updated ([a-z]+ \d+ 202\d+)/)) {
                                item.date = _date(match[1])
                            }
                        }
                        break

                    case "table":
                        item[state] = _table($n)
                        break
                        
                    case "h1":
                    case "h2":
                    case "h3":
                        if (text$ === "status of cases in ontario") {
                            state = "status"
                        } else if (text$ === "new confirmed positive cases") {
                            state = "cases"
                        } else {
                            if (ad.verbose) {
                                console.log("-", "unknown header:", n.tagName, text$)
                            }
                            state = "unknown"
                        }
                        break
                    }
                })
            })

            if (ad.verbose) {
                console.log("-", "item", item)
            }

            if (!item.date || (_.size(item) < 2)) {
                console.log("#", "no data for", COUNTRY, PROVINCE, item)
                _.promise.bail(sd)
            }

            sd.path = path.join(__dirname, "raw", `${item.date}.yaml`)
            sd.json = item

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
        .then(fetch.json.get("https://api.ontario.ca/api/drupal/page%2F2019-novel-coronavirus?fields=body"))
        .make(sd => {
            sd.document = "<div id='pagebody'>" + sd.json.body.und[0].safe_value + "</div>"
        })
        .then(_pull)
        .except(_.error.log)
}
