/*
 *  data/ca-population.js
 *
 *  David Janes
 *  IOTDB
 *  2020-03-15
 *  🔪🗡
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

const FILE = path.join(__dirname, "ca-spending-raw.yaml")
const NAME = "ca-spending.yaml"

_.promise()
    .then(fs.read.yaml.p(FILE))
    .make(sd => {
        sd.json = _.pairs(sd.json)
            .map(row => ({
                country: "CA",
                state: row[0],
                key: `CA-${row[0]}`.toLowerCase(),
                spending: row[1],
            }))
    })
    .then(fs.write.yaml.p(NAME, null))
    .except(_.error.log)
