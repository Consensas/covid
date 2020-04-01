const _ = require("iotdb-helpers")
const fs = require("iotdb-fs")
const document = require("iotdb-document")

_.promise()
    .then(fs.read.yaml.p("zones.yaml"))
    .make(sd => {
        const zones = []

        sd.json.forEach(zone => {
                if (!zone.fragments) {
                    let fragment 
                    switch (zone.region) {
                    case "NS":
                        fragment = zone.name
                            .toLowerCase()
                            .replace(/\s*-\s*/, ",")
                            .replace(/^zone/, "")
                        break

                    case "NB":
                        fragment = zone.name
                            .toLowerCase()
                            .replace(/[)]$/, "")
                            .replace(/ [(]/, ",")
                            .replace(/ area/, "")
                            .replace(/^zone/, "")
                        break

                    case "NL":
                        fragment = zone.name
                            .toLowerCase()
                            .replace(/ regional integrated health authority$/, "")
                        break

                    case "QC":
                        fragment = zone.name
                            .toLowerCase()
                            .replace(/région du /, "")
                            .replace(/région de l'/, "")
                            .replace(/région de la /, "")
                            .replace(/région des /, "")
                            .replace(/région de /, "")
                        break

                    case "BC":
                        fragment = zone.name
                            .toLowerCase()
                            .replace(/ health service delivery area$/, "")
                        break

                    case "ON":
                        fragment = zone.name
                            .toLowerCase()
                            .replace(/ district health unit$/, "")
                            .replace(/ health unit$/, "")
                            .replace(/ regional$/, "")
                            .replace(/^the /, "")
                            .replace(/^city of /, "")
                            .replace(/ and$/, "")
                        break

                    case "AB":
                        fragment = zone.name
                            .toLowerCase()
                            .replace(/ zone$/, "")
                        break

                    case "MB":
                        fragment = zone.name
                            .toLowerCase()
                            .replace(/ regional health$/, "")
                            .replace(/ regional health authority$/, "")
                            .replace(/ health$/, "")
                        break

                    case "SK":
                        fragment = zone.name
                            .toLowerCase()
                            .replace(/ regional health authority$/, "")
                            .replace(/ health authority$/, "")
                            .replace(/ health authorities$/, "")
                        break
                    }

                    if (fragment) {
                        zone.fragments = fragment.split(/(,|\band)/)
                            .map(x => x.trim())
                            .filter(x => x !== "and")
                            .filter(x => x !== ",")
                            .filter(x => x.length)
                    }
                }

                zone = {
                    "@id": zone["@id"],
                    country: "CA",
                    region: zone.region,
                    identifier: `${zone.id}`,
                    ...zone,
                }
                delete zone.id

                zones.push(zone)

                /*
                if (region.region == "SK") {
                    console.log(zone)
                }
                */
        })

        sd.json = zones
        
    })
    .then(document.from.yaml)
    .make(sd => {
        sd.document = sd.document
            .replace(/^-/mg, "\n-")
            .replace(/^    /mg, "  ")
    })
    .then(fs.write.stdout)
    .catch(_.error.log)
