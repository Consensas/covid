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

node ../../tools/pull-tables \
    --url "https://stjohnsairport.com/arrtable.php?v=202004040756" \
    --path "raw/YYYY-MM-DD.arr.yaml"

node ../../tools/pull-tables \
    --url "https://stjohnsairport.com/dep.php?v=202004040756" \
    --path "raw/YYYY-MM-DD.dep.yaml"

git add raw/*.yaml
git commit -am "new raw data"
