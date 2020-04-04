/*
 *  _util/zoned.exact.js
 *
 *  David Janes
 *  Consensas
 *  2020-04-05
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
const zone_exact = (matchd, zoneds) => {
    const _util = require("../_util")
    const nname = _util.normalize.text(matchd.name)

    return zoneds
        .filter(zoned => !matchd.country || _.is.Equal(matchd.country, zoned.country))
        .filter(zoned => !matchd.region || _.is.Equal(matchd.region, zoned.region))
        .find(zoned => {
            if (_.is.Equal(nname, _util.normalize.text(zoned.name))) {
                return zoned
            } else {
                return _.d.list(zoned, "aliases", []).find(alias => _.is.Equal(nname, _util.normalize.text(alias)))
            }
        }) || null
}

/**
 *  API
 */
module.exports = zone_exact
