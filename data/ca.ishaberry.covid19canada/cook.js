/*
 *  data/ca-cases/cook.js
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

const path = require("path")
const _util = require("../../_util")

const _normalize_province = op => {
    const np = {
        "Alberta": "AB",
        "BC": "BC",
        "Manitoba": "MB",
        "NL": "NL",
        "New Brunswick": "NB",
        "Nova Scotia": "NS",
        "Ontario": "ON",
        "PEI": "PE",
        "Quebec": "QC",
        "Repatriated": "XXRP",
        "Saskatchewan": "SK",
        "NWT": "NT",
        "Yukon": "YT",
    }[op]

    if (!np) {
        console.log("#", "data/ca.cases/cook", "don't know province", op)
        process.exit(1)
    }

    return np
}

const _date = d => {
    const match = d.match(/^(\d\d)-(\d\d)-(\d\d\d\d)$/)
    if (match) {
        return `${match[3]}-${match[2]}-${match[1]}`
    }

    return null
}

const _boolean = v => {
    switch (v) {
    case 0:
    case "0":
        return true
    case 1:
    case "1":
        return true
    case "":
    case "Not Reported":
        return null
    default:
        console.log("#", "data/ca.cases/cook", "don't know boolean", v)
        process.exit(1)
    }
}

const _integer = x => _.coerce.to.Integer(x.replace(/,/g, ""), null)

const _sex = v => {
    switch (v) {
    case "Male":
        return "Male"
    case "Female":
        return "Female"
    case "Not Reported":
        return null
    default:
        console.log("#", "data/ca.cases/cook", "don't know sex", v)
        process.exit(1)
    }
}

const _age = v => {
    if (v === "Not Reported") {
        return null
    } else {
        return v || null
    }
}

const _health_region = v => {
    if (v === "Not Reported") {
        return null
    } else {
        return v || null
    }
}

/**
 */
const _one = _.promise((self, done) => {
    _.promise(self)
        .validate(_one)

        .make(sd => {
            const region = _normalize_province(sd.json.province)

            sd.record = Object.assign(
                _util.record.main(sd.settings, {
                    record_id: sd.json.case_id,
                }, {
                    region: region,
                }),
                {
                    dataset_id: sd.json.case_id,
                    region_id: sd.json.provincial_case_id,
                    sources: sd.json.case_source
                        .split(";")
                        .map(x => x.replace(/^.*http/, "http"))
                        .map(x => x.trim()),
                    date: _date(sd.json.date_report),
                    week_reported: _date(sd.json.report_week),
                    is_travel: _boolean(sd.json.travel_yn),
                    age_range: _age(sd.json.age),
                    gender: _sex(sd.json.sex),
                    health_region: _health_region(sd.json.health_region),
                    acquired_country: null,
                })

            switch (_util.normalize.text(sd.json.locally_acquired || "")) {
            case "":
                break

            case "close contact":
                sd.record.acquired_close_contact = true
                sd.record.acquired_country = "CA"
                break

            case "community":
                sd.record.acquired_community = true
                sd.record.acquired_country = "CA"
                break

            default:
                console.log("#", "data/ca.cases/cook", "don't know acquired", sd.json.locally_acquired)
                process.exit(1)
            }
        })

        .end(done, self, _one)
})

_one.method = "_one"
_one.description = ``
_one.requires = {
    json: _.is.Dictionary,
}
_one.accepts = {
}
_one.produces = {
    record: _.is.Dictionary,
}

/**
 */
const _write = _.promise((self, done) => {
    _.promise(self)
        .validate(_write)

        .add("path", path.join(__dirname, "cooked", `${self.json[0].key}.yaml`))
        .then(fs.write.yaml)
        .log("path", "path")

        .end(done, self, _write)
})

_write.method = "_write"
_write.description = ``
_write.requires = {
    json: _.is.Array,
}
_write.accepts = {
}
_write.produces = {
}

/**
 */
_.promise({
    settings: {
        authority: "ishaberry",
        dataset: "covid19canada",
        country: "ca",
        region: null,
    },
})
    .add("path", path.join(__dirname, "raw", "cases.yaml"))
    .then(fs.read.json.magic)
    .each({
        method: _one,
        inputs: "json:json",
        outputs: "records",
        output_selector: sd => sd.record,
    })

    /*
    .then(fs.list.p(path.join(__dirname, "raw")))
    .each({
        method: _one,
        inputs: "paths:path",
        outputs: "records",
        output_selector: sd => sd.record,
    })
    .make(sd => {
        const rsd = {}

        sd.records.forEach(record => {
            rsd[record.key] = rsd[record.key] || []
            rsd[record.key].push(record)
        })

        sd.rss = _.values(rsd)
    })
    .each({
        method: _write,
        inputs: "rss:json",
    })
    */

    .make(sd => {
        sd.json = _.uniqWith(sd.records.map(record => ({
            region: record.region || null,
            health_region: record.health_region || null,
        })), _.is.Equal)
        sd.path = "xxx.json"
    })
    .then(fs.write.json)

    .except(_.error.log)

