/*
 *  tools/push-sheets/load_datasets.js
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
const google = require("iotdb-google")
const fs = require("iotdb-fs")

const path = require("path")
const minimist = require("minimist")

/**
 */
const _load_dataset = _.promise((self, done) => {
    _.promise(self)
        .validate(_load_dataset)

        .add("path", path.join(__dirname, "../../data", self.dataset))
        .then(fs.read.json.magic)

        .make(sd => {
            if (sd.json.key) {
                sd.datasets[sd.json.key] = sd.json
            }
        })

        .end(done, self, _load_dataset)
})

_load_dataset.method = "_load_dataset"
_load_dataset.description = ``
_load_dataset.requires = {
    dataset: _.is.String,
}
_load_dataset.accepts = {
}
_load_dataset.produces = {
}

/**
 */
const load_datasets = _.promise((self, done) => {
    _.promise(self)
        .validate(load_datasets)

        .add("datasets", {})
        .each({
            method: _load_dataset,
            inputs: "settings/datasets:dataset",
        })

        .end(done, self, load_datasets)
})

load_datasets.method = "load_datasets"
load_datasets.description = ``
load_datasets.requires = {
    settings: {
        datasets: _.is.Array,
    },
}
load_datasets.accepts = {
}
load_datasets.produces = {
    datasets: _.is.Dictionary,
}

/**
 *  API
 */
exports.load_datasets = load_datasets
