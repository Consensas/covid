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

node ../../tools/pull-csv \
    --url "http://www.bccdc.ca/Health-Info-Site/Documents/BCCDC_COVID19_Dashboard_Lab_Information.csv" \
    --any-cert \
    --force
node ../../tools/pull-csv \
    --url "http://www.bccdc.ca/Health-Info-Site/Documents/BCCDC_COVID19_Dashboard_Case_Details.csv" \
    --path "raw/cases.yaml" \
    --any-cert \
    --force

node cook.js
git add raw/*.yaml
git commit -am "new raw data"
