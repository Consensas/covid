/*
 *  tools/pull-json.js
 *
 *  David Janes
 *  Consensas
 *  2020-04-05
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
const _util = require("../_util")

const minimist = require("minimist")
const ad = minimist(process.argv.slice(2), {
    boolean: [
        "force",
        "any-cert",
    ],
    string: [
        "url",
        "path",
    ],
    alias: {
    },
    default: {
        "path": "raw/YYYY-MM-DD.yaml",
    }
})

const help = message => {
    const name = "publish"

    if (message) {
        console.log(`${name}: ${message}`)
        console.log()
    }

    console.log(`\
usage: ${name} [options] <url>

options:

--url <url>     url to download
--path <path>   path to write to
--force         clobber the path if need be
`)

    process.exit(message ? 1 : 0)
}

if (!ad.url && ad._.length) {
    ad.url = ad._.shift()
}
if (_.is.Empty(ad.url)) {
    help("--url argument is required")
}
if (_.is.Empty(ad.path)) {
    help("--path argument is required")
}

if (ad["any-cert"]) {
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0
}

_.promise({
    url: ad.url,
    path: ad.path,
})
    .make(sd => {
        const now = _.timestamp.make()
        sd.path = sd.path
            .replace(/YYYY/, now.substring(0, 4))
            .replace(/MM/, now.substring(5, 7))
            .replace(/DD/, now.substring(8, 10))
    })
    .then(fs.exists)
    .conditional(sd => sd.exists && !ad.force, _.promise.bail)

    .then(fetch.json.get(null))
    .then(fs.make.directory.parent)
    .then(fs.write.yaml)
    .log("wrote", "path")

    .except(_.promise.unbail)
    .catch(_.error.log)
