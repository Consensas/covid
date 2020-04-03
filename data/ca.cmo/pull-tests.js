/*
 *  data/ca.cmo/pull-tests.js
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

const _util = require("../../_util")

const minimist = require("minimist")
const ad = minimist(process.argv.slice(2), {
    boolean: [
    ],
    string: [
    ],
    alias: {
    },
})

/**
 */
const _pull = _.promise((self, done) => {
    _.promise(self)
        .validate(_pull)
        .make(sd => {
            sd.json = {
                date: null,
                tables: [],
            }

            const $ = cheerio.load(self.document)

            $("meta[name='dcterms.issued']").each((x, e) => {
                if (e.attribs.content) {
                    sd.json.date = new Date(e.attribs.content).toISOString().substring(0, 10)
                }
            })

            $("table").each((x, e) => {
                const rows = _util.normalize.object(_util.cheerio.table($, $(e)))
                if (rows.length <= 1) {
                    return
                }

                if (_.is.Equal(rows[0], [ 'title', 'date' ])) {
                    return
                }

                sd.json.tables.push(rows)
            })

            sd.path = path.join(__dirname, "raw", `${sd.json.date}.yaml`)

            if (_.is.Empty(sd.json.date)) {
                console.log("#", "data/ca.cmo", "no date", sd.json)
                _.promise.bail(sd)
            }
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

if (ad._.length) {
    _.promise({
        paths: ad._,
    })
        .each({
            method: fs.read.utf8,
            inputs: "paths:path",
            outputs: "documents",
            output_selector: sd => sd.document,
            error: error => {
                console.log("#", _.error.message(error))
            },
        })
        .each({
            method: _pull,
            inputs: "documents:document",
        })
        .except(_.error.log)
} else {
    _.promise()
        .then(fetch.document.get("https://www.canada.ca/en/public-health/services/diseases/2019-novel-coronavirus-infection.html"))
        .then(_pull)
        .except(_.error.log)
}
