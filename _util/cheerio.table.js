/*
 *  _util/cheerio.table.js
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

/**
 */
const cheerio_table = ($, $table) => {
    const rows = []

    $table.find("tr").each((x, etr) => {
        const row = []

        $(etr).find("td,th").each((y, etd) => {
            row.push($(etd).text())
        })

        if (rows.length) {
            row.push(rows)
        }
    })

    return rows
}

/**
 *  API
 */
module.exports = cheerio_table
