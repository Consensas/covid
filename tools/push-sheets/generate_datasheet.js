/*
 *  tools/push-sheets/generate_datasheet.js
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

/**
 */
const generate_datasheet = _.promise(self => {
    _.promise.validate(self, generate_datasheet)

    const sheet = {
        name: self.definition.name,
        rows: [],
    }

    const header = []
    sheet.rows.push(header)

    header.push("Value")

    const datasets = _.keys(self.datasets)
    datasets.sort()
    datasets.forEach(key => {
        const dataset = self.datasets[key]

        // header
        header.push([
            // dataset.locality,
            dataset.state,
            // dataset.country,
        ].filter(p => p).join(", "))

        // values
        self.definition.values
            .filter(vd => vd.key && vd.name)
            .forEach(vd => {
                const row = []
                row.push(vd.name)

                let value = dataset[vd.key]
                if (_.is.Nullish(value)) {
                    row.push(value)
                } else if (_.is.Number(value)) {
                    if (vd.multiply) {
                        value = value * vd.multiply
                    }

                    row.push(value)
                } else if (_.is.String(value)) {
                    row.push(value)
                } else {
                    row.push("???")
                }

                sheet.rows.push(row)
            })
    })

    self.sheets.push(sheet)
})

generate_datasheet.method = "generate_datasheet"
generate_datasheet.description = ``
generate_datasheet.requires = {
    datasets: _.is.Dictionary,
    definition: _.is.Dictionary,
    sheets: _.is.Array,
    definition: {
        name: _.is.String,
        values: _.is.Array.of.Dictionary,
    },
}
generate_datasheet.accepts = {
}
generate_datasheet.produces = {
    sheets: _.is.Array,
}

/**
 *  API
 */
exports.generate_datasheet = generate_datasheet
