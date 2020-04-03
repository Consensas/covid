/*
 *  data/ca.cmo/cook.js
 *
 *  David Janes
 *  Consensas
 *  2020-03-23
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
const URL = "https://www.canada.ca/en/public-health/services/diseases/2019-novel-coronavirus-infection.html"


/**
 */
const _one = _.promise((self, done) => {
    _.promise(self)
        .validate(_one)
        .make(sd => {
            sd.json = {
                "@context": "https://consensas.world/m/covid",
                "@id": null,
                "source": URL,
                country: COUNTRY.toUpperCase(),
                region: null,
                key: null,
                items: [],
            }

            const PROVINCE = sd.items[0].region
            if (_.is.Empty(PROVINCE)) {
                sd.json["@id"] = `urn:covid:consensas:${COUNTRY}:cmo`
                sd.json.key = `${COUNTRY}`.toLowerCase()
                sd.path = path.join(__dirname, "cooked", `${COUNTRY}-tests.yaml`.toLowerCase())
            } else {
                sd.json["@id"] = `urn:covid:consensas:${COUNTRY}-${PROVINCE}:cmo`.toLowerCase()
                sd.json.key = `${COUNTRY}-${PROVINCE}`.toLowerCase()
                sd.json.region = PROVINCE
                sd.path = path.join(__dirname, "cooked", `${COUNTRY}-${PROVINCE}-tests.yaml`.toLowerCase())
            }

            sd.items
                .filter(item => item.date)
                .forEach(_item => {
                    const item = {
                        "@id": `${sd.json["@id"]}:${_item.date}`,
                    }

                    _.mapObject(_item, (value, key) => {
                        if (_.is.Integer(value) || (key === "date")) {
                            item[key] = _item[key]
                        }
                    })

                    sd.json.items.push(item)
                })

            sd.json = [ sd.json ]
        })

        /*
        .then(fs.write.yaml)
        .log("wrote", "path")
        */

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

/**
 */
_.promise()
    .add("path", path.join(__dirname, "settings.yaml"))
    .then(fs.read.yaml)
    .add("json:settings")

    .add({
        path: path.join(__dirname, "raw"),
        fs$filter_name: name => name.match(/^[\d-]+[.]yaml$/)
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
        sd.jsons
            .filter(json => json.date && json.tables && json.tables.length)
            .forEach(json => {
                let tests = -1

                json.tables 
                    .filter(table => table[0][0].indexOf("province") === -1)
                    .forEach(table => {
                        let testx = -1
                        const header = table.shift()
                        if (_.is.Equal(header, [
                            'total number of patients tested in canada',
                            'total positive',
                            'total negative' ])) {
                            testx = 0
                        } else if (_.is.Equal(header, [ 'negative', 'positive', 'total' ])) {
                            testx = 2
                        }

                        table.forEach(row => {
                            if ((tests === -1) && (testx !== -1) && _.is.Integer(row[testx])) {
                                tests = row[testx]
                            }
                        })
                    })

                console.log(json.date, tests)
            })
    })

    .except(_.error.log)

