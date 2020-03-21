/*
 *  data/qc-cmo/pull.js
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
const fs = require("iotdb-fs")
const fetch = require("iotdb-fetch")

const path = require("path")
const child_process = require("child_process")
const cheerio = require("cheerio")
const parse = require("date-fns/parse")

const minimist = require("minimist")
const ad = minimist(process.argv.slice(2), {
    boolean: [
    ],
    string: [
    ],
    alias: {
    },
})

const USER = "sante_qc"

const COUNTRY = "ca"
const PROVINCE = "qc"

/**
 */
const _pull = _.promise((self, done) => {
    _.promise(self)
        .validate(_pull)

        // figure out last tweet
        .add({
            path: path.join(__dirname, "raw"),
            fs$filter_name: name => name.match(/^\d+[.]yaml$/)
        })
        .then(fs.make.directory)
        .then(fs.list)

        .make((sd, sdone) => {
            const biggest = sd.paths
                .map(p => path.basename(p, ".yaml"))
                .reduce((maximum, id) => maximum > id ? maximum : id, "")

            const command = _.is.Empty(biggest) ?
                `twarc timeline ${USER}` :
                `twarc --since_id ${biggest} timeline ${USER}`;

            child_process.exec(command, {
                maxBuffer: 1024 * 1024 * 1024,
            }, (error, stdout, stderr) => {
                if (error) {
                    error.self = sd
                    return sdone(error)
                }

                sd.stderr = stderr
                sd.document = stdout 

                sdone(null, sd)
            });
        })
        .make(sd => {
            sd.jsons = sd.document
                .split("\n")
                .filter(line => line.startsWith("{"))
                .map(line => JSON.parse(line))
                .map(json => ({
                    created_at: json.created_at,
                    id_str: json.id_str,
                    full_text: json.full_text,
                }))
                .filter(json => !json.full_text.startsWith("RT @"))
        })
        
        .each({
            method: _.promise((sd, sdone) => {
                _.promise(sd)
                    .add("path", `raw/${sd.json.id_str}.yaml`)
                    .then(fs.write.yaml)
                    .log("wrote", "path")
                    .end(sdone, sd)
            }),
            inputs: "jsons:json"
        })

        .end(done, self, _pull)
})

_pull.method = "_pull"
_pull.description = ``
_pull.requires = {
}
_pull.accepts = {
}
_pull.produces = {
}

/**
 */
_.promise()
    .then(_pull)
    .except(_.error.log)
