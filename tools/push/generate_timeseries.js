/*
 *  tools/push-sheets/generate_timeseries.js
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
const generate_timeseries = _.promise(self => {
    _.promise.validate(self, generate_timeseries)

    const sheet = {
        name: self.definition.name,
        rows: [],
    }

    const header = []
    sheet.rows.push(header)

    header.push("Date")

    const datasets = _.keys(self.datasets)
    datasets.sort()

    // find min/max date
    let min_date = null
    let max_date = null

    datasets.forEach(key => {
        const dataset = self.datasets[key]
        const ts = _.d.list(dataset, self.definition.timeseries, [])
        ts.forEach(td => {
            const date = _.d.first(td, self.definition.date)
            if (!_.is.String(date) || !date.match(/^20\d\d-\d\d-\d\d$/)) {
                return
            }

            if (!min_date || (date < min_date)) {
                min_date = date
            }
            if (!max_date || (date > max_date)) {
                max_date = date
            }
        })

        // header
        header.push([
            // dataset.locality,
            dataset.state,
            // dataset.country,
        ].filter(p => p).join(", "))
    })

    if (min_date < "2020-01-01") {
        min_date = "2020-01-01"
    }
    if (max_date > "2020-12-31") {
        max_date = "2020-12-31"
    }

    // each row is a date
    const cursor = new Date(min_date)
    while (true) {
        const date = cursor.toISOString().substring(0, 10)
        if (date > max_date) {
            break
        }
        cursor.setDate(cursor.getDate() + 1)

        const row = [ date ]
        sheet.rows.push(row)

        // add values
        datasets.forEach(key => {
            const dataset = self.datasets[key]

            const tds = _.d.list(dataset, self.definition.timeseries, [])
            const td = tds.find(td => _.d.first(td, self.definition.date) === date) 
            const value = _.d.first(td, self.definition.value)
            if (_.is.Nullish(value)) {
                row.push("")
            } else if (_.is.Number(value)) {
                row.push(value)
            } else if (_.is.String(value)) {
                row.push(value)
            } else {
                row.push("???")
            }
        })
    }

    self.sheets.push(sheet)
})

generate_timeseries.method = "generate_timeseries"
generate_timeseries.description = ``
generate_timeseries.requires = {
    datasets: _.is.Dictionary,
    sheets: _.is.Array,
    definition: {
        name: _.is.String,
        timeseries: _.is.String,
        date: _.is.String,
        value: _.is.String,
    },
}
generate_timeseries.accepts = {
}
generate_timeseries.produces = {
    sheets: _.is.Array,
}

/**
 *  API
 */
exports.generate_timeseries = generate_timeseries
