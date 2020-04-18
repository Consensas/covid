/*
 *  data/ab-cmo/pull-new.js
 *
 *  David Janes
 *  Consensas
 *  2020-04-18
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

const _util = require("../../_util")

const path = require("path")
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

const COUNTRY = "ca"
const PROVINCE = "ab"

/**
 */
const _pull = _.promise((self, done) => {
    _.promise(self)
        .validate(_pull)
        .make(sd => {
            let match

            sd.json = {
                cases: [],
            }

            const $ = cheerio.load(self.document)

            $("script").each((x, e) => {
                const html = $(e).html()
                let json
                try {
                    json = JSON.parse(html)
                } catch (x) {
                    return

                }
                const options = _.d.list(json, "x/options/buttons", [])
                if (!options.length) {
                    return
                } else if (options[0].filename !== "covid19dataexport") {
                    return
                }

                const datas = _.d.list(json, "x/data", [])
                if (datas.length !== 7) {
                    return
                }

                for (var row = 0; row < datas[0].length; row++) {
                    sd.json.cases.push({
                        id: datas[0][row],
                        date: datas[2][row],
                        zone: datas[2][row],
                        gender: datas[3][row],
                        age: datas[4][row],
                        status: datas[5][row],
                        type: datas[6][row],
                    })
                }
            })

            sd.path = path.join(__dirname, "raw", "cases.yaml")
        })

        .then(fs.make.directory.parent)
        .then(fs.write.yaml)
        .log("wrote", "path")

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


_.promise()
    .then(fetch.document.get("https://covid19stats.alberta.ca"))
    .then(_pull)
    .except(_.error.log)
