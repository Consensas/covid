/*
 *  data/world.jhu-csee/cook.js
 *
 *  David Janes
 *  Consensas
 *  2020-03-15
 *  🔪🗡
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

const _util = require("../../_util")

const path = require("path")

/**
 */
const _find = (_items, _name) => (_items || []).find(item => item.name.toLowerCase() === _name.toLowerCase()) || null
const _year = v => v.length === 4 ? v : `20${v}`
const _month = v => v.length === 2 ? v : `0${v}`
const _day = v => v.length === 2 ? v : `0${v}`

/**
 */
const _cook = _.promise((self, done) => {
    _.promise.validate(self, _cook)

    _.promise(self)
        .then(fs.read.yaml.p(path.join(__dirname, "..", "world.jhu-csse", "raw", `${self.name}.yaml`)))

        // add country
        .make(sd => {
            sd.json.forEach(row => {
                row._country = ""

                let country = _find(sd.datasets.countries, row.country_region)
                if (!country) {
                    console.log("#", "data/cooked/cook", "unknown country:", row.country_region)
                    return
                }

                row._country = country.value
            })
        })

        // add state
        .make(sd => {
            sd.json.forEach(row => {
                row._state = ""

                if (!row.province_state) {
                    return
                }

                const state_data = sd.datasets[row._country.toLowerCase()]
                if (!state_data) {
                    return
                }

                const province_state = row.province_state.replace(/^.*, /, "")

                const state = _find(state_data, province_state)
                if (state) {
                    row._state = state.value
                    return
                }

                if ((row._country === "US") && (province_state.length === 2)) {
                    row._state = province_state
                    return
                }

                switch (row.province_state) {
                case "From Diamond Princess": row._state = "XXDP"; return
                case "Quebec": row._state = "QC"; return
                case "Diamond Princess": row._state = "XXDP"; return
                case "Grand Princess": row._state = "XXGP"; return
                case "Washington, D.C.": row._state = "DC"; return
                case "Virgin Islands, U.S.": row._state = "VI"; return
                case "United States Virgin Islands": row._state = "VI"; return
                }

                if (!row._state) {
                    console.log("#", "data/cooked/cook", "unknown state:", row.province_state)
                    return
                }
            })
        })

        // build rows
        .make(sd => {
            sd.json.forEach(row => {
                const key = row._state ? `${row._country.toLowerCase()}-${row._state.toLowerCase()}` : row._country.toLowerCase()
                const result = sd.results[key] = sd.results[key] || {
                    "@context": _util.context,
                    "@id": null,
                    key: key,
                    country: row._country,
                    state: row._state || null,
                    items: {},
                }

                if (([ "CA", "US", "AU" ].indexOf(result.country) > -1) && result.state) {
                    result.state = result.state.toUpperCase()
                }

                if (result.state) {
                    result["@id"] = `urn:covid:jhe.edu:csse:${result.country}-${result.state}`.toLowerCase()
                } else {
                    result["@id"] = `urn:covid:jhe.edu:csse:${result.country}`.toLowerCase()
                }

                /*
                if (result.state === "ON") {
                    console.log(row)
                    process.exit()
                }
                */

                _.keys(row)
                    .map(row => row.match(/^(\d+)_(\d+)_(\d+)$/))
                    .filter(match => match)
                    .forEach(match => {
                        const o = match[0]
                        const m = match[1]
                        const d = match[2]
                        const y = match[3]
                        const date = `${_year(y)}-${_month(m)}-${_day(d)}`

                        result.items[date] = result.items[date] || {
                            "@id": `${result["@id"]}:${date}`,
                            "date": date,
                        }
                        result.items[date][sd.name] = row[o]
                    })
            })

        })

        .end(done, self, _cook)
})

_cook.method = "_cook"
_cook.description = ``
_cook.requires = {
    name: _.is.String,
    datasets: {
        countries: _.is.Array,
        ca: _.is.Array,
        au: _.is.Array,
        us: _.is.Array,
    },
    results: _.is.Dictionary,
}
_cook.produces = {
    results: _.is.Dictionary,
}

/**
 */
const _load_dataset = _.promise((self, done) => {
    _.promise(self)
        .validate(_load_dataset)

        .then(fs.read.yaml.p(path.join(__dirname, "..", "datasets", self.dataset)))
        .make(sd => {
            const name = path.basename(self.dataset).replace(/[.].*$/, "")
            sd.datasets[name] = sd.json
        })

        .end(done, self, _load_dataset)
})

_load_dataset.method = "_load_dataset"
_load_dataset.description = ``
_load_dataset.requires = {
    datasets: _.is.Dictionary,
    dataset: _.is.String,
}
_load_dataset.produces = {
    datasets: _.is.Dictionary,
}
_load_dataset.params = {
    dataset: _.p.normal,
}
_load_dataset.p = _.p(_load_dataset)

/**
 */
const _fix = _.promise(self => {
    _.promise.validate(self, _fix)

    _.values(self.results)
        .forEach(result => {
            result.items = _.values(result.items)
            result.items.sort((a, b) => _.is.unsorted(a.date, b.date))
        })
})

_fix.method = "_fix"
_fix.description = ``
_fix.requires = {
    results: _.is.Dictionary,
}
_fix.accepts = {
}
_fix.produces = {
    results: _.is.Dictionary,
}

/**
 */
const _aggregate = _.promise(self => {
    _.promise.validate(self, _aggregate)

    const cdd = {}

    _.values(self.results)
        .filter(result => result.state)
        .forEach(result => {
            const cd = cdd[result.country] = cdd[result.country] || {
                "@context": _util.context,
                "@id": `urn:covid:jhe.edu:csse:${result.country}`.toLowerCase(),
                country: result.country,
                state: null,
                key: result.country.toLowerCase(),
                items: [],
            }

            cd.items = [].concat(cd.items, result.items)
        })

    _.values(cdd)
        .forEach(result => {
            const idd = {}

            result.items.forEach(oitem => {
                const id = idd[oitem.date] = idd[oitem.date]  || {
                    "@id": `urn:covid:jhe.edu:csse:${result.country}:${oitem.date}`.toLowerCase(),
                    "date": oitem.date,
                }

                id.deaths = (id.deaths || 0) + (oitem.deaths || 0)
                id.confirmed = (id.confirmed || 0) + (oitem.confirmed || 0)
                id.recovered = (id.recovered || 0) + (oitem.recovered || 0)
            })

            result.items = _.values(idd)
            result.items.sort((a, b) => _.is.unsorted(a.date, b.date))

            self.results[result.country] = result
        })
})

_aggregate.method = "_aggregate"
_aggregate.description = ``
_aggregate.requires = {
    results: _.is.Dictionary,
}
_aggregate.accepts = {
}
_aggregate.produces = {
    results: _.is.Dictionary,
}

/**
 */
const _write = _.promise((self, done) => {
    _.promise(self)
        .validate(_write)

        .add("path", path.join(__dirname, "cooked", `${self.json.key}.yaml`))
        .then(fs.make.directory.parent)
        .then(fs.write.yaml)
        .log("wrote", "path")

        .end(done, self, _write)
})

_write.method = "_write"
_write.description = ``
_write.requires = {
    json: {
        country: _.is.String,
        key: _.is.String,
        items: _.is.Array,
    }
}
_write.accepts = {
    json: {
        state: _.is.String,
    }
}
_write.produces = {
}

/**
 */
_.promise({
    datasets: {},
    results: {},
})
    // names of things
    .add("data", [ "ca.yaml", "us.yaml", "au.yaml", "countries.yaml" ])
    .each({
        method: _load_dataset,
        inputs: "data:dataset",
    })

    // core data
    .add("names", [ "deaths", "confirmed", "recovered", ])
    .each({
        method: _cook,
        inputs: "names:name",
    })
    .then(_fix)

    // CA, AU, US
    .then(_aggregate)

    // write each file
    .make(sd => {
        sd.jsons = _.values(sd.results)
    })
    .each({
        method: _write,
        inputs: "jsons:json",
    })

    .except(_.error.log)
