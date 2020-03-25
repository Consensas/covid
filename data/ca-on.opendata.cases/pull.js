/*
 *  data/ca-on.opendata/pull.js
 *
 *  David Janes
 *  Consensas
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

const path = require("path")

/**
 */
_.promise({
})
    .add("path", path.join(__dirname, "settings.yaml"))
    .then(fs.read.yaml)
    .add("json:settings")

    .add("settings/source:url")
    .then(fetch.document.get())
    .then(xlsx.load.csv)
    .add("jsons:json")

    .add("path", path.join(__dirname, "raw", "cases.yaml"))
    .then(fs.make.directory.parent)
    .then(fs.write.yaml)

    .except(_.error.log)
