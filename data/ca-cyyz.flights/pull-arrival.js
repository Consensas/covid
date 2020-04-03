/*
 *  data/ca-cyyz.flights/pull-arrival.js
 *
 *  David Janes
 *  Consensas
 *  2020-04-04
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
const fetch = require("iotdb-fetch")

const path = require("path")
const _util = require("../../_util")

_.promise()
    .make(sd => {
        const date = _.timestamp.make().substring(0, 10)
        sd.path = path.join(__dirname, "raw", `${date}.arr.yaml`)
    })
    .then(fs.exists)
    .conditional(sd => sd.exists, _.promise.bail)

    .then(fetch.json.get("https://gtaa-fl-prod.azureedge.net/api/flights/list?type=ARR&day=today&useScheduleTimeOnly=false"))
    .then(fs.make.directory.parent)
    .then(fs.write.yaml)
    .log("wrote", "path")

    .except(_.promise.unbail)
    .catch(_.error.log)
