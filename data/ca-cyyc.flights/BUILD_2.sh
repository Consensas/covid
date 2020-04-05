#
#   BUILD_2.sh
#
#   David Janes
#   Consensas
#   2020-04-05
#
#   Update local database
#

set -e
cd $(dirname $0)

node ../../tools/pull-json \
    --any-cert \
    --url "https://rmsflightdata.yyc.com:8091/flights" \
    --path "raw/YYYY-MM-DD.yaml"

git add raw/*.yaml
git commit -am "new raw data"
