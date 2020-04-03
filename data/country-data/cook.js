/*
 *  data/country-data/cook.js
 *
 *  David Janes
 *  Consensas
 *  2020-03-20
 *
 *  Copyright (2013-2020) Consensas
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
})
    .add({
        path: path.join(__dirname, "raw"),
        fs$filter_name: name => name.match(/[.]json$/)
    })
    .then(fs.make.directory)
    .then(fs.list)
    .each({
        method: fs.read.json.magic,
        inputs: "paths:path",
        outputs: "jsons",
        output_selector: sd => sd.json,
        output_filter: json => _.is.Array.of.Dictionary,
        output_flatten: true,
    })
    .make(sd => {
        const cd = {}
        sd.jsons
            .filter(record => record.country)
            .forEach(record => {
                cd[record.country] = Object.assign(
                    cd[record.country] || {},
                    record
                )
            })
        

        sd.json = _.values(cd)
        sd.json.forEach(record => {
            [ 
                "elevation",
                "height",
                "costline",
                "north",
                "south",
                "west",
                "east",
                "independence",
                "expectancy",
                "density",
                "population",
                "area",
                "temperature",
                "landlocked",
            ].forEach(key => {
                record[key] = _.coerce.to.Number(record[key], null)
            })

            record.name = record.country || null
            record.country = record.abbreviation || null
            record.coastline = record.costline

            delete record.abbreviation
            delete record.costline
        })

        sd.path = path.join(__dirname, "countries.yaml")
    })

    .then(fs.make.directory.parent)
    .then(fs.write.yaml)
    .log("wrote", "path")
    
    .catch(_.error.log)
