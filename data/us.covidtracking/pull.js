/*
 *  data/us.covidtracking/pull.js
 *
 *  David Janes
 *  Consensas
 *  2020-03-23
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
const cheerio = require("cheerio")
const parse = require("date-fns/parse")

const minimist = require("minimist")
const ad = minimist(process.argv.slice(2), {
    boolean: [
        "all",
    ],
    string: [
    ],
    alias: {
    },
})

const COUNTRY = "us"

/**
 */
const _pull = _.promise((self, done) => {
    _.promise(self)
        .validate(_pull)

        .then(fetch.json.get())
        .make(sd => {
            // HACK!
            sd.json.forEach(d => {
                d.date = d.date || _.coerce.to.Integer(_.timestamp.make().substring(0, 10).replace(/-/g, ""))
            })
        })
        .each({
            method: _.promise((sd, sdone) => {
                _.promise(sd)
                    .add("path", `raw/${sd.json.date}.yaml`)
                    .then(fs.make.directory.parent)
                    .then(fs.write.yaml)
                    .log("wrote", "path")
                    .end(sdone, sd)
            }),
            inputs: "json:json"
        })

        .end(done, self, _pull)
})

_pull.method = "_pull"
_pull.description = ``
_pull.requires = {
    url: _.is.String,
}
_pull.accepts = {
}
_pull.produces = {
}


_.promise()
    .add("url", ad.all ? "https://covidtracking.com/api/us/daily" : "https://covidtracking.com/api/us")
    .then(_pull)
    .except(_.error.log)
