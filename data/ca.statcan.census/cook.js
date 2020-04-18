/*
 *  data/ca.statcan.census/cook.js
 *
 *  David Janes
 *  Consensas
 *  2020-04-18
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
const xlsx = require("iotdb-xlsx")

const path = require("path")
const _util = require("../../_util")

// const FILE = path.join(__dirname, "raw", "98-401-X2016058_English_CSV_data.csv")
const FILE = path.join(__dirname, "raw", "sample.csv")

/**
 */
const _one_zone = _.promise((self, done) => {
    _.promise(self)
        .validate(_one_zone)
        .make(sd => {
            sd.json = _util.record.main({
                "authority": "statcan.gc.ca",
                "dataset": "census2016",
            }, sd.records[0].zone)

            sd.json.health_region = sd.records[0].zone.identifier

            sd.records.forEach(record => {
                let key = _.id.slugify(record.dim_profile_of_health_regions_2247_)
                let mapped = sd.settings.mapping[key]
                if (_.is.Nullish(mapped)) {
                    return
                } else if (mapped === "") {
                    mapped = key
                }

                const value = record.dim_sex_3_member_id_1_total_sex

                sd.json[mapped] = value
            })

            console.log(sd.json)
        })
        .end(done, self, _one_zone)
})

_one_zone.method = "_one_zone"
_one_zone.description = ``
_one_zone.requires = {
    settings: {
        mapping: _.is.Dictionary,
    },
    records: _.is.Array.of.Dictionary,
}
_one_zone.accepts = {
}
_one_zone.produces = {
}

/**
 */
_.promise()
    .then(fs.read.yaml.p(path.join(__dirname, "settings.yaml")))
    .add("json:settings")

    .then(fs.read.yaml.p(path.join(__dirname, "..", "ca.statcan.health-regions", "zones.yaml")))
    .make(sd => {
        sd.zoned = {}
        sd.json.forEach(zone => {
            sd.zoned[zone.identifier] = zone
        })
    })

    .then(fs.read.utf8.p(FILE))
    .then(xlsx.load.csv)
    .make(sd => {
        sd.recordss = []
        
        let current
        let current_geo_code
        sd.jsons.forEach(json => {
            json.alt_geo_code = "" + json.alt_geo_code
            json.zone = sd.zoned[json.alt_geo_code]
            if (!json.zone) {
                return
            }

            if (json.alt_geo_code !== current_geo_code) {
                current = []
                current_geo_code = json.alt_geo_code

                sd.recordss.push(current)
            }

            current.push(json)
        })
    })
    .each({
        method: _one_zone,
        inputs: "recordss:records",
    })

    .except(_.error.log)
