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

/**
 */
const initialize = _.promise((self, done) => {
    let credentials
    let token

    try {
        credentials = require("../../.cfg/credentials.json")
        token = require("../../.cfg/token.json")
    } catch (x) {
        console.log("#", "use bin/google-token to get tokens first")
    }

    _.promise(self)
        .validate(initialize)

        .add("google$cfg", {
            credentials: credentials,
            token: token,
        })
        .then(google.initialize)
        .then(google.auth.token)
        .then(google.sheets.initialize)

        .end(done, self, initialize)
})

initialize.method = "initialize"
initialize.description = ``
initialize.requires = {
}
initialize.accepts = {
}
initialize.produces = {
    google: _.is.Object,
}

/**
 */
const publish = _.promise((self, done) => {
    _.promise(self)
        .validate(publish)

        .make(sd => {
            sd.title = sd.sheet.name
            sd.path = `/${sd.settings.google.sheet}/${sd.sheet.name}`
            sd.jsons = sd.sheet.rows
        })
        .log("publish", "title")
        .then(google.sheets.parse)
        .then(google.sheets.sheets)
        .then(google.sheets.sheets.select)
        .conditional(sd => !sd.sheet, google.sheets.sheets.add)
        .then(google.sheets.put)

        .end(done, self, publish)
})

publish.method = "publish"
publish.description = ``
publish.requires = {
    google: _.is.Object,
    sheet: {
        name: _.is.String,
        rows: _.is.Array,
    },
    settings: {
        google: {
            sheet: _.is.String,
        },
    },
}
publish.accepts = {
}
publish.produces = {
}

/**
 */
exports.google = {
    initialize: initialize,
    publish: publish,
}
