#
#   BUILD_1.sh
#
#   David Janes
#   Consensas
#   2020-03-17
#   ☘️o
#
#   Update local database
#

set -e
cd $(dirname $0)

##node pull.js
node ../../tools/pull-csv \
    --url "https://novascotia.ca/coronavirus/data/COVID-19-data.csv" \
    --any-cert \
    --force

node cook.js
git add raw/*.yaml
git commit -am "new raw data"
