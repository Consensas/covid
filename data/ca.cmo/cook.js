/*
 *  data/ca.cmo/cook.js
 *
 *  David Janes
 *  Consensas
 *  2020-03-29
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

const _util = require("../../_util")

const path = require("path")

const mapping = {
    "Alberta": "AB",
    "British Columbia": "BC",
    "Canada": "",
    "Manitoba": "MB",
    "New Brunswick": "NB",
    "Newfoundland and Labrador": "NL",
    "Northwest Territories": "NT",
    "Nova Scotia": "NS",
    "Nunavut": "NU",
    "Ontario": "ON",
    "Prince Edward Island": "PE",
    "Quebec": "QC",
    "Repatriated Travellers": "XXTR",
    "Repatriated travellers": "XXTR",
    "Saskatchewan": "SK",
    "Yukon": "YK",
}

/**
 */
const _one = _.promise((self, done) => {
    _.promise(self)
        .validate(_one)
        .make(sd => {
            const PROVINCE = sd.items[0].region ? sd.items[0].region : null

            sd.json = _util.record.main(sd.settings, {
                region: PROVINCE,
            })
            sd.json.items = []
            sd.path = path.join(__dirname, "cooked", _util.record.filename(sd.settings, {
                region: PROVINCE,
            }))

            sd.items
                .filter(item => item.date)
                .forEach(_item => {
                    const item = {}
                    item["@id"] = _util.record.urn(sd.settings, {
                        region: PROVINCE,
                        date: _item.date,
                    })

                    _.mapObject(_item, (value, key) => {
                        if (_.is.Integer(value) || (key === "date")) {
                            item[key] = _item[key]
                        }
                    })

                    sd.json.items.push(item)
                })

            sd.json = [ sd.json ]
        })

        .then(fs.write.yaml)
        .log("wrote", "path")

        .end(done, self, _one)
})

_one.method = "_one"
_one.description = ``
_one.requires = {
    items: _.is.Array.of.Dictionary,
}
_one.accepts = {
}
_one.produces = {
}

_.promise()
    .add("path", path.join(__dirname, "settings.yaml"))
    .then(fs.read.yaml)
    .add("json:settings")

    .then(fs.read.yaml.p(path.join(__dirname, "raw", "data.yaml")))
    .make(sd => {
        const rsd = {}

        sd.json
            .map(record => ({
                region: mapping[record.prname] || null,
                date: (d => `${d.substring(6, 10)}-${d.substring(3, 5)}-${d.substring(0, 2)}`)(record.date),
                tests_positive: _.coerce.to.Integer(record.numconf, null),
                tests_probable: _.coerce.to.Integer(record.numprob, null),
                deaths: _.coerce.to.Integer(record.numdeaths, null),
            }))
            .forEach(record => {
                rsd[record.region] = rsd[record.region] || []
                rsd[record.region].push(record)
            })

        sd.rss = _.values(rsd)
    })
    .each({
        method: _one,
        inputs: "rss:items",
    })
    
    .except(_.error.log)
