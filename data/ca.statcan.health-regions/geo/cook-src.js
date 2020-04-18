/*
 *  data/ca.statcan.health-regions/geo/cook-src.js
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

/**
 */
const _write_geojson = _.promise((self, done) => {
    _.promise(self)
        .validate(_write_geojson)

        .make(sd => {
            sd.json = _.d.clone(sd.json)
            sd.json.features = [ sd.feature ]
            sd.path = path.join(__dirname, "geojson", `${sd.feature.properties.HR_UID}.json`)
        })
        .then(fs.make.directory.parent)
        .then(fs.write.yaml)
        .log("wrote", "path")

        /*
        .then(fs.read.json)
        .make(sd => {
            sd.features = (sd.json.features || [])
                .filter(feature => feature.properties && feature.properties.HR_UID)
                .filter(feature => feature.type === "Feature")
        })
        .each({
            method: _write_geojson,
            inputs: "features:feature",
        })
        */

        .end(done, self, _write_geojson)
})

_write_geojson.method = "_write_geojson"
_write_geojson.description = ``
_write_geojson.requires = {
    path: _.is.String,
    json: _.is.Dictionary,
    feature: {
        properties: {
            HR_UID: _.is.String,
        },
    },
}
_write_geojson.accepts = {
}
_write_geojson.produces = {
}

/**
 */
const _read_one = _.promise((self, done) => {
    _.promise(self)
        .validate(_read_one)

        .then(fs.read.json)
        .make(sd => {
            sd.features = (sd.json.features || [])
                .filter(feature => feature.properties && feature.properties.HR_UID)
                .filter(feature => feature.type === "Feature")
        })
        .each({
            method: _write_geojson,
            inputs: "features:feature",
        })

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
        fs$filter_name: name => name.endsWith(".geojson"),
    })
    .then(fs.list.p(path.join(__dirname, "src")))
    .each({
        method: _read_one,
        inputs: "paths:path",
        outputs: "jsons",
    })

    /*
    // manual data
    .then(fs.read.yaml.p(path.join(__dirname, "manual.yaml")))
    .make(sd => {
        const d = {};
        [].concat(sd.jsons, sd.json)
            .filter(item => item.date)
            .forEach(item => {
                d[item.date] = Object.assign({ "@id": null, }, d[item.date] || {}, item)
            })

        sd.items = _.values(d)
        sd.items.sort((a, b) => _.is.unsorted(a.date, b.date))
    })

    .make(sd => {
        const record = _util.record.main(sd.settings)
        record.items = sd.items

        record.items.forEach(item => {
            item["@id"] = `${record["@id"]}:${item.date}`

            if (!_.is.Integer(item.tests_negative) && _.is.Integer(item.tests_positive) && _.is.Integer(item.tests)) {
                item.tests_negative = item.tests - item.tests_positive
            }
        })

        sd.json = [ record ]
        sd.path = path.join(__dirname, "cooked", _util.record.filename(sd.settings))
    })

    .then(fs.make.directory.parent)
    .then(fs.write.yaml)
    .log("wrote", "path")
    */

    .except(_.error.log)
