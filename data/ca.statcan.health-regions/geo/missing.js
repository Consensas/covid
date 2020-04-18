/*
 *  data/ca.statcan.health-regions/geo/missing.js
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
_.promise({})
    .add({
        fs$filter_name: name => name.endsWith(".json"),
    })
    .then(fs.list.p(path.join(__dirname, "geojson")))
    .make(sd => {
        sd.haved = {}
        sd.paths.forEach(p => {
            sd.haved[path.basename(p, ".json")] = true
        })
    })

    .then(fs.read.yaml.p(path.join(__dirname, "..", "zones.yaml")))
    .make(sd => {
        sd.json
            .filter(zone => !sd.haved[zone.identifier])
            .forEach(zone => {
                console.log("-", "missing", zone.identifier, zone.region, zone.name)
            })
    })

    .except(_.error.log)
