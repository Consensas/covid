/*
 *  data/ca.statcan.census/cook.js
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
const xlsx = require("iotdb-xlsx")

const path = require("path")

// const FILE = path.join(__dirname, "raw", "98-401-X2016058_English_CSV_data.csv")
const FILE = path.join(__dirname, "raw", "sample.csv")

/*

{ census_year: 2016,
  geo_code_por_: 1,
  geo_level: 0,
  geo_name: 'Canada',
  gnr: 4,
  gnr_lf: 5.1,
  data_quality_flag: 20000,
  alt_geo_code: 1,
  dim_profile_of_health_regions_2247_: 'Population, 2016',
  member_id_profile_of_health_regions_2247_: 1,
  notes_profile_of_health_regions_2247_: 1,
  dim_sex_3_member_id_1_total_sex: 35151728,
  dim_sex_3_member_id_2_male: '...',
  dim_sex_3_member_id_3_female: '...' }
*/

/**
 */
const _one_zone = _.promise((self, done) => {
    _.promise(self)
        .validate(_one_zone)
        .make(sd => {
            sd.json = {}

            sd.records.forEach(record => {
                const key = _.id.slugify(record.dim_profile_of_health_regions_2247_)
                const value = record.dim_sex_3_member_id_1_total_sex

                sd.json[key] = value
            })

            console.log(sd.json)
        })
        .end(done, self, _one_zone)
})

_one_zone.method = "_one_zone"
_one_zone.description = ``
_one_zone.requires = {
    records: _.is.Array.of.Dictionary,
}
_one_zone.accepts = {
}
_one_zone.produces = {
}

/**
 */
_.promise()
    .then(fs.read.utf8.p(FILE))
    .then(xlsx.load.csv)
    .make(sd => {
        sd.recordss = []
        
        let current
        let current_geo_code
        sd.jsons.forEach(json => {
            if (json.alt_geo_code !== current_geo_code) {
                current = []
                current_geo_code = json.alt_geo_code

                sd.recordss.push(current)
            }

            current.push(json)
        })
    })
    .each({
        method: _one_zone,
        inputs: "recordss:records",
    })

    /*
        const pd = {}

        sd.jsons
            .filter(row => row.age)
            .forEach(row => {
                let key
                let match

                match = row.age.match(/^(\d+) to (\d+) years$/)
                if (match) {
                    key = `age_${match[1]}_${match[2]}`
                }

                match = row.age.match(/^(\d+) years and over/)
                if (match) {
                    key = `age_${match[1]}_up`
                }

                if (row.age === "All ages") {
                    key = "population"
                } else if (row.age === "Median age") {
                    key = "age_median"
                } else if (row.age === "Age group3 5") {
                    return
                }

                _.keys(row)
                    .filter(key => key.length === 2)
                    .forEach(province => {
                        pd[province] = pd[province] || {
                            country: "CA",
                            region: province.toUpperCase(),
                            key: `CA-${province}`.toLowerCase(),
                        }

                        const value = row[province]
                        if (_.is.Number(value)) {
                            pd[province][key] = value
                        } else if (_.is.String(value)) {
                            pd[province][key] = _.coerce.to.Integer(value.replace(/,/g, ""), null)
                        } else {
                            pd[province][key] = null
                        }
                    })
            })

        sd.json = _.values(pd)
    */
    // .then(fs.write.yaml.p(NAME, null))
    .except(_.error.log)
