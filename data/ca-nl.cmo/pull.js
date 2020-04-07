/*
 *  data/ca-nl.cmo/pull.js
 *
 *  David Janes
 *  Consensas
 *  2020-04-06
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

const COUNTRY = "ca"
const PROVINCE = "nl"

/**
 */
const _pull = _.promise((self, done) => {
    _.promise(self)
        .validate(_pull)
        .make(sd => {
            const item = _.d.first(sd.json, "/features/attributes")
            if (!item) {
                console.log("#", "ca-nl.cmo - no data?")
                process.exit(1)
            }

            item.date = new Date(item.date_of_update_max).toISOString().substring(0, 10)
            item.url = sd.url

    
            sd.path = path.join(__dirname, "raw", `${item.date}.yaml`)
            sd.json = item

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

const QUERY = JSON.stringify([
    {"onStatisticField":"total_cases","outStatisticFieldName":"total_cases_max","statisticType":"max"},
    {"onStatisticField":"total_hospitalized","outStatisticFieldName":"total_hospitalized_max","statisticType":"max"},
    {"onStatisticField":"total_deaths","outStatisticFieldName":"total_deaths_max","statisticType":"max"},
    {"onStatisticField":"total_recovered","outStatisticFieldName":"total_recovered_max","statisticType":"max"},
    {"onStatisticField":"total_tests_delivered","outStatisticFieldName":"total_tests_delivered_max","statisticType":"max"},
    {"onStatisticField":"date_of_update","outStatisticFieldName":"date_of_update_max","statisticType":"max"},
])
const BASE = "https://services8.arcgis.com/aCyQID5qQcyrJMm2/arcgis/rest/services/Covid19_ProvPublic/FeatureServer/0/query?f=json&where=1%3D1&outFields=*&returnGeometry=false"

_.promise()
    .then(fetch.document.get("https://covid-19-newfoundland-and-labrador-gnl.hub.arcgis.com/"))
    .make(sd => {
        const match = sd.document.match(/(services\d+[.]arcgis[.]com)(\/[^/]+\/arcgis\/rest\/services\/Covid19_ProvPublic\/FeatureServer\/0)/)

        const url = new URL(BASE)
        url.host = match[1]
        // url.pathname = match[2]
        url.searchParams.set("outStatistics", QUERY)

        sd.url = url.toString()
        // console.log(sd.url)
    })

    
    .then(fetch.json.get(null))
    .then(_pull)
    .except(_.error.log)
