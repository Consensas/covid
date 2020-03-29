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
        const records = []

        sd.jsons.forEach(json => {
            const data = {}

            json.tables.forEach(rows => {
                rows = rows.map(row => row.map(cell => sd.settings.mapping[cell] || cell))
                const header = rows.shift()

                let table = []
                rows.forEach(row => {
                    table.push(_.object(header, row))
                })

                if (header[0] === "province") {
                    table.forEach(row => {
                        const province = row.province || "xxxx"
                        if (province !== province.toUpperCase()) {
                            return
                        }

                        const d = data[province] || {}
                        data[province] = d

                        _.mapObject(row, (value, key) => {
                            if (_.is.Number(value)) {
                                d[key] = value
                            }
                        })
                    })
                } else {
                    const row = table[0]
                    const province = ""
                    const d = data[province] || {}
                    data[province] = d

                    _.mapObject(table[0], (value, key) => {
                        if (_.is.Number(value)) {
                            d[key] = value
                        }
                    })
                }
            })

            _.mapObject(data, (value, region) => {
                records.push(Object.assign({
                    date: json.date,
                    region: region,
                }, value))
            })
        })

        sd.itemss = []
        _.uniq(records.map(r => r.region)).forEach(region => {
            sd.itemss.push(records.filter(record => record.region === region))
        })
    })
    .each({
        method: _one,
        inputs: "itemss:items",
    })

    /*
    */

    .except(_.error.log)

