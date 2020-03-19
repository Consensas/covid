#
#   BUILD.sh
#
#   David Janes
#   Consensas
#   2020-03-17
#   ☘️o
#
#   This will pull all the databases that need
#   to updated from time to time.
#

ROOT=$(dirname $0)

for COUNT in 2 1 0
do
    for FILE in $(find "$ROOT" -name "BUILD_$COUNT.sh")
    do
        echo $FILE
        bash $FILE
    done
done
git push
