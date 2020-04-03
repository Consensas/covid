#
#   BUILD_2.sh
#
#   David Janes
#   Consensas
#   2020-03-25
#
#   Update local database
#

set -e
cd $(dirname $0)

node pull.js
node pull-tests.js
node cook.js
git add raw/*.yaml
git commit -am "new raw data"
