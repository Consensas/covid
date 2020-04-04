/*
 *  data/ca.cihi/zonemap.js
 *
 *  David Janes
 *  Consensas
 *  2020-04-05
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

    // read zones we need to map
    .then(fs.read.json.magic.p(path.join(__dirname, "raw", "beds.yaml")))
    .add("json:beds")

    .make(sd => {
        sd.beds.forEach(bed => {
            let zoned = _util.zone.exact({
                name: bed.health_region, 
                region: bed.province, 
                country: "CA",
            }, sd.zoneds)

            if (!zoned) {
                const zds = _util.zone.fuzzy({
                    name: bed.health_region, 
                    region: bed.province, 
                    country: "CA",
                }, sd.officials)
                assert.ok(_.is.Array(zds))

                if (zds.length === 1) {
                    zoned = zds[0]
                } else {
                    console.log("#", bed.province, bed.health_region, zds)
                }
            }

            if (!zoned) {
                sd.zoneds.push({
                    "@id": null,
                    country: "CA",
                    region: bed.province,
                    name: bed.health_region,
                    aliases: [],
                })
            }
        })

        sd.zoneds.sort((a, b) => _.is.unsorted(a.region, b.region) || _.is.unsorted(a.health_region, b.health_region))


        // console.log(sd.zoneds)
    })
    
    /*
    .then(fs.read.json.magic.p("../ca.statcan.health-regions/zones.yaml"))
    .add("json:zones")

    .add("datas", require("./xxx.json"))
    .make(sd => {
        sd.datas.forEach(d => {
            console.log("")
            const zones = sd.zones.filter(zone => zone.region === d.region)
            const region = d.health_region.toLowerCase()
            zones.forEach(zone => {
                console.log(d.region, region, zone.fragments)
            })
        })
    })
    */


    .except(_.error.log)
