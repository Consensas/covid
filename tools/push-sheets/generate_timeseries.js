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
        header: [],
        rows: [],
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
