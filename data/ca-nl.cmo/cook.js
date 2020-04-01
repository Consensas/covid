/*
 *  data/nl-cmo/cook.js
 *
 *  David Janes
 *  Consensas
 *  2020-03-22
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

const path = require("path")
const _util = require("../../_util")

_.promise({
    settings: {
        authority: "consensas",
        dataset: "cmo",
        region: "nl",
        country: "ca",
    },
})
    .then(fs.read.yaml.p(path.join(__dirname, "manual.yaml")))
    .make(sd => {
        const record = _util.record.main(sd.settings)
        record.items = sd.json

        sd.json = [ record ]
        sd.path = path.join(__dirname, "cooked", _util.record.filename(sd.settings))
    })

    .then(fs.make.directory.parent)
    .then(fs.write.yaml)
    .log("wrote", "path")

    .except(_.error.log)
