/*
 *  data/ca-qc.cmo/cook.js
 *
 *  David Janes
 *  Consensas
 *  2020-03-20
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

const parse = require("date-fns/parse")
const fr_locale = require('date-fns/locale/fr')

const path = require("path")

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

_.promise({
    settings: {
        authority: "consensas",
        dataset: "cmo",
        region: "QC",
        country: "CA",
    },
})
    .add({
        path: path.join(__dirname, "raw"),
        fs$filter_name: name => name.match(/^\d+[.]yaml$/)
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
        sd.json = _util.record.main(sd.settings)
        sd.json.items = []

        sd.jsons
            .filter(json => json.full_text.match(/#COVID19.*Au.Québec/))
            .forEach(json => {
                let match 

                const tweet = json.full_text
                const item = {
                    "@id": null,
                }

                if (ad.verbose) {
                    console.log("----")
                    console.log(tweet)

                    item.tweet = tweet
                }

                if (match = tweet.match(/en date du (\d+) ([^\s,.]+)/)) {
                    const day = match[1]
                    const month = {
                        "janvier": "January",
                        "février": "February",
                        "mars": "March",
                        "avril": "April",
                        "mai": "May",
                        "juin": "June",
                        "juillet": "July",
                        "août": "August",
                        "septembre": "September",
                        "octobre": "October",
                        "novembre": "November",
                        "décembre": "December",
                    }[match[2]];

                    const date$ = `${day} ${month} 2020`
                    let date = parse(`${day} ${month} 2020`, "d MMMM yyyy", new Date())
                    if (_.is.Date(date)) {
                        date = date.toISOString().substring(0, 10)
                        item.date = date
                    }
                } else {
                    item.tweet = json.full_text
                }

                if (match = tweet.match(/\s*([\d, ]+) cas conf/)) {
                    item.tests_positive = _util.normalize.integer(match[1])
                }

                if (match = tweet.match(/\s*([\d, ]+) personnes s/)) {
                    item.tests_ordered = _util.normalize.integer(match[1])
                }

                if (match = tweet.match(/\s*([\d, ]+) analyses n/)) {
                    item.tests_negative = _util.normalize.integer(match[1])
                }

                item.tests = (item.tests_negative || 0) + (item.tests_positive || 0)
                
                if (ad.verbose) {
                    console.log("-", "item", item)
                }

                sd.json.items.push(item)
            })

        sd.json.items.forEach(item => {
            item["@id"] = `${sd.json["@id"]}:${item.date}`
        })

        sd.json = [ sd.json ]
        sd.path = path.join(__dirname, "cooked", _util.record.filename(sd.settings))
    })

    .then(fs.make.directory.parent)
    .then(fs.write.yaml)
    .log("wrote", "path")

    .except(_.error.log)

