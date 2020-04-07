#
#   BUILD_2.sh
#
#   David Janes
#   Consensas
#   2020-03-23
#
#   Update local database
#

set -e
cd $(dirname $0)

node pull.js 
node pull.js --states
node cook.js
(
    cd raw || exit 1
    for folder in *
    do
        git add $folder/*.yaml
    done
)
git commit -am "new raw data"
