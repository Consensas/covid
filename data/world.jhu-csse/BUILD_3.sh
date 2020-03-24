#
#   data/world.jhu-csse/BUILD_3.sh
#
#   David Janes
#   Consensas
#   2020-03-17
#   ☘️o
#
#   Pull raw data
#

cd $(dirname $0)

node pull.js
git commit -am "new raw data"
