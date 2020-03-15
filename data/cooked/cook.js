/*
 *  data/cooked/cook.js
 *
 *  David Janes
 *  IOTDB
 *  2020-03-15
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

const path = require("path")

/**
 */
const _cook = _.promise((self, done) => {
    _.promise.validate(self, _cook)

    _.promise(self)
        .then(fs.read.yaml.p(path.join(__dirname, "..", "raw", `${self.name}.yaml`)))
        .make(sd => {
        })

        .end(done, self, _cook)
})

_cook.method = "_cook"
_cook.description = ``
_cook.requires = {
    name: _.is.String,
}
_cook.produces = {
}

/**
 */
const _load_data = dataset => _.promise((self, done) => {
    _.promise(self)
        .validate(_load_data)

        .then(fs.read.yaml.p(path.join(__dirname, "..", "datasets", `${dataset}.yaml`)))
        .make(sd => {
            sd.datasets[sd.dataset] = sd.json
        })

        .end(done, self, _load_data)
})

_load_data.method = "_load_data"
_load_data.description = ``
_load_data.requires = {
    datasets: _.is.Dictionary,
}
_load_data.produces = {
    datasets: _.is.Dictionary,
}

/**
 */
_.promise({
    datasets: {},
})
    .then(_load_data("ca"))
    .then(_load_data("us"))
    .then(_load_data("au"))
    .then(_load_data("countries"))

    .add("names", [ "deaths", "confirmed", "recovered", ])
    .add("names", [ "deaths", ]) // 
    .each({
        method: _cook,
        inputs: "names:name",
    })

    .except(_.error.log)
