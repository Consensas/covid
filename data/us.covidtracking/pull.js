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
        "states",
    ],
    string: [
    ],
    alias: {
    },
})

const COUNTRY = "us"

/**
 */
const _do_date = _.promise((self, done) => {
    _.promise(self)
        .validate(_do_date)

        .make(sd => {
            sd.path = path.join(
                __dirname,
                "raw",
                !_.is.Empty(sd.json.state) ? `us-${sd.json.state.toLowerCase()}` : "us",
                `${sd.json.date}.yaml`)
        })

        .then(fs.make.directory.parent)
        .then(fs.write.yaml)
        .log("wrote", "path")

        .end(done, self, _do_date)
})

_do_date.method = "_do_date"
_do_date.description = ``
_do_date.requires = {
    json: {
        date: _.is.Integer,
    },
}
_do_date.accepts = {
}

/**
 */
const _do_state = _.promise((self, done) => {
    _.promise(self)
        .validate(_do_state)

        .each({
            method: _do_date,
            inputs: "state:json"
        })

        .end(done, self, _do_state)
})

_do_state.method = "_do_state"
_do_state.description = ``
_do_state.requires = {
}
_do_state.accepts = {
}
_do_state.produces = {
}

/**
 */
const _pull = _.promise((self, done) => {
    _.promise(self)
        .validate(_pull)

        .then(fetch.json.get())
        .make(sd => {
            const stated = {}

            sd.json.forEach(d => {
                d.date = d.date || _.coerce.to.Integer(_.timestamp.make().substring(0, 10).replace(/-/g, ""))
                d.state = d.state || ""

                stated[d.state] = stated[d.state] || []
                stated[d.state].push(d)
            })

            sd.states = _.values(stated)
        })
        .each({
            method: _do_state,
            inputs: "states:state"
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

let url 
if (ad.states) {
    if (ad.all) {
        url = "https://covidtracking.com/api/v1/states/daily.json"
    } else {
        url = "https://covidtracking.com/api/v1/states/current.json"
    }
} else {
    if (ad.all) {
        url = "https://covidtracking.com/api/us/daily"
    } else {
        url = "https://covidtracking.com/api/us"
    }
}

_.promise({ 
    url: url,
})
    .then(_pull)
    .except(_.error.log)
