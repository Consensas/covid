/*
 *  data/bc-cmo/pull.js
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
        "verbose",
    ],
    string: [
    ],
    alias: {
    },
})

const COUNTRY = "ca"
const PROVINCE = "bc"

/**
 */
const _pull = _.promise((self, done) => {
    _.promise(self)
        .validate(_pull)
        .make(sd => {
            sd.json = {
            }

            const $ = cheerio.load(self.document)

            $("li").each((x, e) => {
                let match

                const text = _util.normalize.text($(e).text())
                if (ad.verbose) {
                    console.log("-", "li.text", text)
                }

                if (match = text.match(/([\d,]+).tests.complete.*(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d+),\s+(202\d)/)) {
                    const date = parse(`${match[2]} ${match[3]} ${match[4]}`, "MMMM dd yyyy", new Date())
                    if (_.is.Date(date)) {
                        sd.json.date = date.toISOString().substring(0, 10)
                    }

                    const value = _util.normalize.integer(match[1])
                    if (value) {
                        sd.json.tests = value
                    }
                } else if (match = text.match(/^([\d,]+) tests complete/)) {
                    const value = _util.normalize.integer(match[1])
                    if (value) {
                        sd.json.tests = value
                    }
                } else if (match = text.match(/([\d,]+) confirmed/)) {
                    const value = _util.normalize.integer(match[1])
                    if (value) {
                        sd.json.tests_positive = value
                    }
                } else if (match = text.match(/([\d,]+) deaths in bc/)) {
                    const value = _util.normalize.integer(match[1])
                    if (value) {
                        sd.json.deaths = value
                    }
                } else if (match = text.match(/([\d,]+) recovered in bc/)) {
                    const value = _util.normalize.integer(match[1])
                    if (value) {
                        sd.json.recovered = value
                    }
                }
            })

            $("p").each((x, e) => {
                const text = _util.normalize.text($(e).text())
                if (ad.verbose) {
                    console.log("-", "p.text", text)
                }

                let match = text.match(/([\d,]+).individuals.*as.of.([A-Za-z]*) (\d+) (\d+)/)
                if (!match) {
                    match = text.match(/([\d,]+) confirmed cases as of ([a-z]*) (\d+) (\d+)/)
                }
                if (!match) {
                    return
                }

                const date = parse(`${match[2]} ${match[3]} ${match[4]}`, "MMMM dd yyyy", new Date())
                if (!_.is.Date(date)) {
                    return 
                }

                const value = _.coerce.to.Integer(match[1].replace(/,/g, ""), null)
                if (!value) {
                    return
                }

                sd.json.tests_positive = value
                sd.json.date = date.toISOString().substring(0, 10)
            })

            if (ad.verbose) {
                console.log("-", "json", sd.json)
            }

            if (_.size(sd.json) < 2) {
                console.log("#", "no data for", COUNTRY, PROVINCE)
                _.promise.bail(sd)
            }

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
        .then(fetch.document.get("http://www.bccdc.ca/health-info/diseases-conditions/covid-19/case-counts-press-statements"))
        .then(_pull)
        .except(_.error.log)
}
