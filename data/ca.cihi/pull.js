/*
 *  data/datasets/pull.js
 *
 *  David Janes
 *  Consensas
 *  2020-04-01
 *
 *  Copyright (2013-2020) Consensas, Inc.
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
 *
 *  DATA SOURCE
 *  https://www.cma.ca/sites/default/files/pdf/Physician%20Data/12-Phys_per_pop.pdf
 */

"use strict"

const _ = require("iotdb-helpers")
const fs = require("iotdb-fs")
const xlsx = require("iotdb-xlsx")

const path = require("path")

const FILE = path.join(__dirname, "ca-doctors.csv")
const NAME = "ca-doctors.yaml"

/**
 */
const _one = _.promise((self, done) => {
    _.promise(self)
        .validate(_one)

        .add("data/input:path")
        .then(fs.read.buffer)
        .then(xlsx.load.raw)
        .make(sd => {
            sd.jsons = sd.json[sd.data.sheet]
            if (!sd.jsons) {
                console.log("#", "data/ca.cihi/pull", "sheet not found:", sd.data.sheet)
                _.promise.bail(sd)
            }

            for (let i = 0; i < sd.data.header; i++) {
                sd.jsons.shift()
            }

            if (!sd.jsons.length) {
                console.log("#", "data/ca.cihi/pull", "no header?", sd.data.sheet)
                _.promise.bail(sd)
            }

            const header = sd.jsons.shift().map(cell => _.id.slugify(cell || "").replace(/_*$/, ""))

            sd.json = sd.jsons
                .map(row => {
                    while (row.length < header.length) {
                        row.push(null)
                    }
                    row.length = header.length

                    row = row.map(cell => _.is.String(cell) ? cell.trim() : cell)
                    row = _.zipObject(header, row)

                    delete row['']

                    return row
                })
                .filter(row => !sd.data.filter || sd.data.filter(row))

            sd.path = sd.data.output
        })

        .then(fs.make.directory.parent)
        .then(fs.write.yaml)
        .log("wrote", "path")

        .end(done, self, _one)
})

_one.method = "_one"
_one.description = ``
_one.requires = {
    data: {
        input: _.is.String,
        output: _.is.String,
        sheet: _.is.String,
        header: _.is.Integer,
    },
}
_one.accepts = {
    data: {
        filter: _.is.Function,
    },
}
_one.produces = {
}


_.promise({
    datas: [
        {
            input: "src/beds.xlsx",
            output: "raw/beds.yaml",
            sheet: "BSIO 2017–2018",
            header: 2,
            filter: row => _.size(row.province) === 2,
        },
        {
            input: "src/icu.xlsx",
            output: "raw/icu.yaml",
            sheet: "BSIO 2017–2018",
            header: 2,
            filter: row => _.size(row.province) === 2,
        },
    ],
})
    .each({
        method: _one,
        inputs: "datas:data",
    })
    .except(_.error.log)
