/*
 *  data/ca.ishaberry.covid19canada/zonemap.js
 *
 *  David Janes
 *  Consensas
 *  2020-04-19
 *
 *  Copyright (2013-2020) Consensas
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
const assert = require("assert")

const _util = require("../../_util")

const NAME = "zonemap.yaml"

_.promise()
    // read exist zonemap
    .add({
        path: path.join(__dirname, "zonemap.yaml"),
        fs$otherwise_json: [],
    })
    .then(fs.read.yaml)
    .add("json:zoneds")

    // read the offical zones
    .add({
        path: path.join(__dirname, "..", "ca.statcan.health-regions", "zones.yaml"),
        fs$otherwise_json: [],
    })
    .then(fs.read.yaml)
    .add("json:officials")

    // read zones we need to map (read "bed" as "region")
    .then(fs.read.json.magic.p(path.join(__dirname, "regions.json")))
    .add("json:beds")

    .make(sd => {
        let seend = {}

        sd.beds.forEach(bed => {
            if (_.is.Empty(bed.health_region_name) || _.is.Empty(bed.region)) {
                return
            }
            const key = `${bed.region}/${bed.health_region_name}`
            if (seend[key]) {
                return
            }
            seend[key] = true

            let zoned = _util.zone.exact({
                name: bed.health_region_name, 
                region: bed.region, 
                country: "CA",
            }, sd.zoneds)

            if (zoned) {
                return
            }

            const zds = _util.zone.fuzzy({
                name: bed.health_region_name, 
                region: bed.region, 
                country: "CA",
            }, sd.officials)

            assert.ok(_.is.Array(zds))

            /*
            if ((zds.length === 2) && (zds[1].name.indexOf("Health Unit") > -1)) {
                zds.pop()
            }
            */

            if (zds.length === 1) {
                const zd = zds[0]
                
                sd.zoneds.push({
                    "@id": zd["@id"],
                    "country": "CA",
                    "region": zd["region"],
                    "name": zd["name"],
                    "health_region_id": zd.health_region_id,
                    "alias": [ bed.health_region_name ],
                })
            } else {
                console.log("#", bed.region, bed.health_region_name, zds)

                sd.zoneds.push({
                    "country": "CA",
                    "region": bed.region,
                    "name": "",
                    "alias": [ bed.health_region_name ],
                    "maybes": zds.map(zd => ({
                        "@id": zd["@id"],
                        "name": zd["name"],
                        "health_region_id": zd.health_region_id,
                    }))
                })
            }
        })

        sd.zoneds.sort((a, b) => _.is.unsorted(a.region, b.region) || _.is.unsorted(a.health_region_id, b.health_region_id))
        sd.json = sd.zoneds
        sd.path = path.join(__dirname, "zonemap.yaml")
    })
    .then(fs.write.yaml)

    .except(_.error.log)
