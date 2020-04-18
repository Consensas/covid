/*
 *  data/ca.statcan.health-regions/geo/cook-geojson.js
 *
 *  David Janes
 *  Consensas
 *  2020-04-18
 *
 *  Copyright (2013-2020) Consenas
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

const tokml = require("tokml")

/**
 */
const _read_one = _.promise((self, done) => {
    _.promise(self)
        .validate(_read_one)

        .then(fs.read.json)
        .make(sd => {
            sd.document = tokml(sd.json)
            sd.path = path.join(__dirname, "kml", `${sd.json.features[0].properties.HR_UID}.kml`)
        })
        .then(fs.make.directory.parent)
        .then(fs.write.utf8)
        .log("wrote", "path")

        .end(done, self, _read_one)
})

_read_one.method = "_read_one"
_read_one.description = ``
_read_one.requires = {
    path: _.is.String,
}
_read_one.accepts = {
}
_read_one.produces = {
}

/**
 */
_.promise({})
    .add({
        fs$filter_name: name => name.endsWith(".json"),
    })
    .then(fs.list.p(path.join(__dirname, "geojson")))
    .each({
        method: _read_one,
        inputs: "paths:path",
        outputs: "jsons",
    })

    .except(_.error.log)
