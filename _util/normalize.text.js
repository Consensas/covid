/*
 *  _util/normalize.text.js
 *
 *  David Janes
 *  Consensas
 *  2020-03-24
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
const normalize_text = text => 
    _.coerce.to.String(text)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\xa0/g, " ")
        .replace(/[\s][\s]+/g, " ")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, "");

/**
 *  API
 */
module.exports = normalize_text
