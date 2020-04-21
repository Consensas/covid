#
#   BUILD_1.sh
#
#   David Janes
#   Consensas
#   2020-03-19
#
#   Update local database
#

cd $(dirname $0)

node ../../tools/pull-csv \
    --url "https://raw.githubusercontent.com/ishaberry/Covid19Canada/master/cases.csv" \
    --path "raw/cases.yaml" \
    --any-cert \
    --force
node cook.js --write-zones

git add cooked/ca-*.yaml
git commit -am "new raw data"


exit 0
set -e
node pull.js
node cook.js
(
cd raw 
git add *0.yaml
git add *1.yaml
git add *2.yaml
git add *3.yaml
git add *4.yaml
git add *5.yaml
git add *6.yaml
git add *7.yaml
git add *8.yaml
git add *9.yaml
)

