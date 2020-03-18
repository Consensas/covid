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

node pull.js
node cook.js
git add raw/*.yaml
git commit -am "new raw data"
