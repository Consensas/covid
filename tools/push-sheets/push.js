/*
 *  tools/push-sheets/push.js
 *
 *  David Janes
 *  Consensas
 *  2020-03-20
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

const path = require("path")
const minimist = require("minimist")

const push = require(".")

const ad = minimist(process.argv.slice(2), {
    boolean: [
    ],
    string: [
    ],
    alias: {
    },
})

/*
let credentials
let token

try {
    credentials = require("../../.cfg/credentials.json")
    token = require("../../.cfg/token.json")
} catch (x) {
    console.log("#", "use bin/google-token to get tokens first")
}
*/


/*
if (!ad._.length) {
    console.log("usage: push.js <sheetid>")
    process.exit()
}
*/

_.promise({
    /*
    googled: {
        credentials: credentials,
        token: token,
    },
    */
})
    // load settings
    .then(fs.read.yaml.p(path.join(__dirname, "settings.yaml")))
    .add("json:settings")

    /*
    .then(google.initialize)
    .then(google.auth.token)
    .then(google.sheets.initialize)
    */

    .then(push.load_datasets)

    .add("sheets", [])
    .each({
        method: push.generate_timeseries,
        inputs: "settings/sheets:definition",
        input_filter: definition => definition.type === "timeseries",
    })
    .each({
        method: push.generate_datasheet,
        inputs: "settings/sheets:definition",
        input_filter: definition => definition.type === "datasheet",
    })

        
    .make(sd => {
        console.log(JSON.stringify(sd.sheets, null, 2))
    })

    /*
    .then(google.sheets.list_values.p({
        spreadsheetId: "12MS8REzfOPCtaw4z9CPJq36AjJis8VOJIil3LP5nXiQ",
        range: "Data",
    }))
    .then(google.sheets.headers.first)

    .add("jsons:json")
    .add("path", path.join(__dirname, "raw", "data.yaml"))
    .then(fs.make.directory.parent)
    .then(fs.write.yaml)
    .log("wrote", "path")
    */
    .catch(_.error.log)

