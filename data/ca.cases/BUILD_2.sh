#
#   BUILD_1.sh
#
#   David Janes
#   Consensas
#   2020-03-19
#
#   Update local database
#

set -e
cd $(dirname $0)

node pull.js
node cook.js
( cd raw && git add *.yaml )
git add cooked/ca-*.yaml
git commit -am "new raw data"
