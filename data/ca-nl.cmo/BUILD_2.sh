#
#   BUILD_2.sh
#
#   David Janes
#   Consensas
#   2020-04-02
#
#   Update local database
#

set -e
cd $(dirname $0)

node cook.js
git commit -am "new raw data"
