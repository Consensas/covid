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

cd $(dirname $0)

node pull.js
node cook-tests.js
