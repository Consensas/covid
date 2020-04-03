
FILES="country-by-abbreviation.json
country-by-alphabet-letters.json
country-by-avg-male-height.json
country-by-barcode-prefix.json
country-by-calling-code.json
country-by-capital-city.json
country-by-continent.json
country-by-costline.json
country-by-currency-code.json
country-by-currency-name.json
country-by-domain-tld.json
country-by-elevation.json
country-by-geo-coordinates.json
country-by-government-type.json
country-by-independence-date.json
country-by-iso-numeric.json
country-by-landlocked.json
country-by-languages.json
country-by-life-expectancy.json
country-by-name.json
country-by-national-symbol.json
country-by-population-density.json
country-by-population.json
country-by-region-in-world.json
country-by-religion.json
country-by-surface-area.json
country-by-yearly-average-temperature.json"

IGNORES="
country-by-flag.json
country-by-national-dish.json
"

mkdir raw 2> /dev/null
for FILE in $FILES
do
    echo "=" $FILE
    curl "https://raw.githubusercontent.com/samayo/country-json/master/src/$FILE" > "raw/$FILE"
done
