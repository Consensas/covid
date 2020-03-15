/*
 *  data/raw/primary.js
 *
 *  David Janes
 *  IOTDB
 *  2020-03-15
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
const xlsx = require("iotdb-xlsx")

const sources = [
    {
        name: "confirmed",
        url: "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv",
    },
    {
        name: "deaths",
        url: "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Deaths.csv",
    },
    {
        name: "recovered",
        url: "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Recovered.csv",
    },
    
]

/**
 */
const _download = _.promise((self, done) => {
    _.promise.validate(self, _download)

    _.promise(self)
        .then(fetch.document.get(self.source.url))
        .then(xlsx.load.csv)
        .add("jsons:json")
        .then(fs.write.yaml.p(`${self.source.name}.yaml`, null))

        .end(done, self, _download)
})

_download.method = "_download"
_download.description = ``
_download.requires = {
    source: {
        name: _.is.String,
        url: _.is.AbsoluteURL,
    },
}
_download.produces = {
}

/**
 */
_.promise({
    sources: sources,
})
    .each({
        method: _download,
        inputs: "sources:source",
    })
    .except(_.error.log)
