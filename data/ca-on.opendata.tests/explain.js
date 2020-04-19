
/*
 *  explain.js
 *
 *  David Janes
 *  Consensas
 *  2020-04-19
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

_.promise()
    .add("path", path.join(__dirname, "cooked", "ca-on.yaml"))
    .then(fs.read.yaml)

    .make(sd => {
        const vds = sd.json.items.map(d => ({
            cases: d.tests_positive,
            removed: (d.recovered || 0) + (d.deaths || 0)
        }))

        console.log(vds)

    })

    .except(_.error.log)
