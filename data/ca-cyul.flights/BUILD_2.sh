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

node pull-arrival.js
node pull-departure.js
git add raw/*.yaml
git commit -am "new raw data"
