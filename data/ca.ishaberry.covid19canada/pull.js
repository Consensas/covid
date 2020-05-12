/*
 *  data/ca-cases/pull.js
 *
 *  David Janes
 *  Consensas
 *  2020-03-18
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
const google = require("iotdb-google")
const fs = require("iotdb-fs")

let credentials
let token

try {
    credentials = require("../../.cfg/credentials.json")
    token = require("../../.cfg/token.json")
} catch (x) {
    console.log("#", "use bin/google-token to get tokens first")
}

const google$cfg = {
    credentials: credentials,
    token: token,
}

const _pad = s => {
    while (s.length < 5) {
        s = `0${s}`
    }

    return s
}

_.promise({
    google$cfg: google$cfg,
})
    .then(google.initialize)
    .then(google.auth.token)
    .then(google.sheets.initialize)
    .then(google.sheets.list_values.p({
        spreadsheetId: "1D6okqtBS3S2NRC7GFVHzaZ67DuTw7LX49-fqSLwJyeo",
        range: "Cases",
    }))
    .make(sd => {
        while (sd.jsons.length && (sd.jsons[0].length < 5)) {
            sd.jsons.shift()
        }
    })
    .then(google.sheets.headers.first)
    .each({
        method: _.promise((sd, sdone) => {
            _.promise(sd)
                .add("path", `raw/${_pad(sd.json.case_id)}.yaml`)
                .then(fs.make.directory.parent)
                .then(fs.write.yaml)
                .end(sdone, sd)
        }),
        inputs: "jsons:json"
    })
    .make(sd => {
        console.log("+", sd.jsons.length)
    })
    .catch(_.error.log)
