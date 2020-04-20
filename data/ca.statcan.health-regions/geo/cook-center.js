/*
 *  data/ca.statcan.health-regions/geo/cook-center.js
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
const _read_one = _.promise((self, done) => {
    _.promise(self)
        .validate(_read_one)

        .then(fs.read.json)
        .make(sd => {
            const health_region_id = sd.json.features[0].properties.HR_UID

            const lons = []
            const lats = []

            if (sd.json.features[0].geometry.type === "Polygon") {
                sd.json.features[0].geometry.coordinates.forEach(bs => {
                    bs.forEach(cs => {
                        lons.push(cs[0])
                        lats.push(cs[1])
                    })
                })
            } else if (sd.json.features[0].geometry.type === "MultiPolygon") {
                sd.json.features[0].geometry.coordinates.forEach(as => {
                    as.forEach(bs => {
                        bs.forEach(cs => {
                            lons.push(cs[0])
                            lats.push(cs[1]) 
                        })
                    })
                })
            } else {
                console.log("WOT2", sd.json.features[0].geometry)
                process.exit()
            }

            if (!lons.length) {
                console.log("WOT", sd.json.features[0].geometry)
                process.exit()
            }

            const lon = lons.reduce((a, b) => a + b, 0) / lons.length
            const lat = lats.reduce((a, b) => a + b, 0) / lats.length

            sd.lld[health_region_id] = [ lat, lon ]
        })

        .end(done, self, _read_one)
})

_read_one.method = "_read_one"
_read_one.description = ``
_read_one.requires = {
    path: _.is.String,
    lld: _.is.Dictionary,
}
_read_one.accepts = {
}
_read_one.produces = {
}

/**
 */
_.promise({
    lld: {}
})
    .add({
        
        fs$filter_name: name => name.endsWith(".json"),
    })
    .then(fs.list.p(path.join(__dirname, "geojson")))
    .each({
        method: _read_one,
        inputs: "paths:path",
        outputs: "jsons",
    })

    .then(fs.read.yaml.p(path.join(__dirname, "..", "zones.yaml")))
    .make(sd => {
        sd.json.forEach(zone => {
            const ll = sd.lld[zone.health_region_id]
            if (ll) {
                zone.latitude = ll[0]
                zone.longitude = ll[1]
            }
        })
    })
    .then(fs.write.yaml.p("zones.yaml"))

    .except(_.error.log)
