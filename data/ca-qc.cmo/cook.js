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

const COUNTRY = "ca"
const PROVINCE = "qc"
const NAME = `${COUNTRY}-${PROVINCE}-tests.yaml`

_.promise()
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
        sd.json = {
            id: "urn:covid:consensas:ca-qc:cmo",
            country: COUNTRY.toUpperCase(),
            state: PROVINCE.toUpperCase(),
            key: `${COUNTRY}-${PROVINCE}`.toLowerCase(),
            items: [],
        }

        const _integer = x => _.coerce.to.Integer(x.replace(/,/g, ""), null)

        sd.jsons
            .filter(json => json.full_text.startsWith("#COVID19 – Au Québec"))
            .forEach(json => {
                const tweet = json.full_text
                const item = {
                    // tweet: json.full_text,
                }

                const date_match = tweet.match(/en date du (\d+) ([^\s,.]+)/)
                if (date_match) {
                    const day = date_match[1]
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
                    }[date_match[2]];

                    const date$ = `${day} ${month} 2020`
                    let date = parse(`${day} ${month} 2020`, "d MMMM yyyy", new Date())
                    if (_.is.Date(date)) {
                        date = date.toISOString().substring(0, 10)
                        item.id = "urn:covid:consensas:ca-qc:cmo:" + date
                        item.date = date
                    }
                } else {
                    item.tweet = json.full_text
                }

                const positive_match = tweet.match(/[➡➡️]\s*([\d,.]+) cas conf/)
                if (positive_match) {
                    item.tests_positive = _integer(positive_match[1])
                }

                const testing_match = tweet.match(/[➡➡️]\s*([\d,.]+) personnes s/)
                if (testing_match) {
                    item.tests_ordered = _integer(testing_match[1])
                }

                const negative_match = tweet.match(/[➡➡️]\s*([\d,.]+) analyses n/)
                if (negative_match) {
                    item.tests_negative = _integer(negative_match[1])
                }

                item.tests = (item.tests_negative || 0) + (item.tests_positive || 0)

                sd.json.items.push(item)
            })

        sd.json = [ sd.json ]
        sd.path = path.join(__dirname, NAME)
    })
    .then(fs.make.directory.parent)
    .then(fs.write.yaml)
    .log("wrote", "path")

    .except(_.error.log)

