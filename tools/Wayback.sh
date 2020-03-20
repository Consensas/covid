#
#   data/tools/Wayback.sh
#
#   David Janes
#   2020-03-17
#   ☘️
#
#   Download all of a file from the wayback machine
#   
#   Needs: https://github.com/hartator/wayback-machine-downloader

if [ $# != 1 ]
then
    echo "usage: $0 <url>"
    exit 1
fi

URL="$1"
    
if [ ! -d websites ]
then
    wayback_machine_downloader --all-timestamps "$1"
fi

for FILE in $(find websites -type f)
do
    NUMBER=$(echo $FILE | sed -e '1 s|websites/[^/]*/\([^/]*\)/.*$|\1|')
    echo $NUMBER
    mv $FILE $NUMBER.html
done

rm -rf websites

    
