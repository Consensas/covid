/*
 *  data/on-cases/pull.js
 *
 *  David Janes
 *  Consensas
 *  2020-03-18
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
const fetch = require("iotdb-fetch")

const path = require("path")

const URL = "https://raw.githubusercontent.com/Russell-Pollari/ontario-covid19/master/data/processed/all_cases.json"

const _pad = s => {
    while (s.length < 5) {
        s = `0${s}`
    }

    return s
}

/**
 */
const _one = _.promise((self, done) => {
    _.promise(self)
        .validate(_one)
        
        .add("path", path.join(__dirname, "raw", `${_pad(self.json.number)}.yaml`))
        .then(fs.make.directory.parent)
        .then(fs.write.yaml)
        .log("case", "json/number")

        .end(done, self, _one)
})

_one.method = "_one"
_one.description = ``
_one.requires = {
    json: {
        number: _.is.String,
        age_and_gender: _.is.String,
        public_health_unit: _.is.String,
        city: _.is.String,
        date: _.is.String,
    },
}
_one.produces = {
}

_.promise()
    .then(fetch.json.get(URL))
    .each({
        method: _one,
        inputs: "json:json",
        error: error => {
            console.log("#", _.error.message(error))
        },
    })
    .except(_.error.log)
