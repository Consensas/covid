/*
 *  data/ca.cmo/pull.js
 *
 *  David Janes
 *  Consensas
 *  2020-03-29
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
const document = require("iotdb-document")

const _util = require("../../_util")

const path = require("path")

/**
 */
_.promise({
})
    .add("path", path.join(__dirname, "settings.yaml"))
    .then(fs.read.yaml)
    .add("json:settings")

    .add("settings/url")
    .then(fetch.document.get())
    .then(document.to.string.utf8)
    .then(xlsx.load.csv)
    .add("jsons:json")

    .add("path", path.join(__dirname, "raw", `data.yaml`))
    .then(fs.make.directory.parent)
    .then(fs.write.yaml)
    .log("path", "path")
    
    .except(error => {
        console.log("#", "data/ca.cmo/pull.js", "could not download:", error.self.source.url)
        throw error
    })
    .except(_.error.log)
