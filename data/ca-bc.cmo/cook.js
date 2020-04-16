/*
 *  data/ca-bc.cmo/cook.js
 *
 *  David Janes
 *  Consensas
 *  2020-04-16
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

const _util = require("../../_util")

const path = require("path")

_.promise({
    settings: {
        authority: "consensas",
        dataset: "cmo",
        region: "bc",
        country: "ca",
    },
})
    .then(fs.read.yaml.p(path.join(__dirname, "raw", "cases.yaml")))
    .add("json:cases")

    .then(fs.read.yaml.p(path.join(__dirname, "raw", "data.yaml")))
    .make(sd => {
        const items = sd.json

        sd.json = _util.record.main(sd.settings)
        sd.json.items = items
            .filter(_item => _item.region === "BC")
            .map(_item => {
                if (!_.is.Integer(_item.total_tests)) {
                    return
                }

                const item = {
                    "@id": `${sd.json["@id"]}:${_item.date}`,
                }
                item.tests = _item.total_tests

                item.tests_positive = _.size(sd.cases
                    .filter(c => c.reported_date < _item.date))

                item.date = _item.date

                return item
            })
            .filter(item => item && item.date)

        if (sd.json.items.length === 0) {
            console.log("#", "ca-bc.cmo: no items???")
        }

        sd.path = path.join(__dirname, "cooked", _util.record.filename(sd.settings))
    })
    
    .then(fs.make.directory.parent)
    .then(fs.write.yaml)
    .log("wrote", "path")
    
    .except(_.error.log)
