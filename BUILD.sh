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
OUT=build.log

git pull || exit 1
(
for COUNT in 3 2 1 0
do
    for FILE in $(find "$ROOT" -name "BUILD_$COUNT.sh")
    do
        echo "===="
        echo $FILE
        echo "===="
        bash $FILE
    done
done
) | tee "$OUT"

git push

echo ""
echo ""
echo "finished: the following (if any) errors occurred"
grep "#" "$OUT"
echo
