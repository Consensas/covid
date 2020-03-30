#
#   BUILD_1.sh
#
#   David Janes
#   Consensas
#   2020-03-17
#   ☘️o
#
#   Discontinued:
#   see "../ca-on.opendata.tests"
#

exit 0

set -e
cd $(dirname $0)

node pull.js
node cook.js
git add raw/*.yaml
git commit -am "new raw data"
