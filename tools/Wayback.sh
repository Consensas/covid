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

function help {
    if [ ! -z "$1" ]
    then
        echo "$0: $1"
        echo
    fi

    echo "usage: $0 [options] <url>"
    echo
    echo "options:"
    echo "--max <N>          maximum N downloads"
    echo "--from <timestamp> "

    if [ -z "$1" ]
    then
        exit 0
    else
        exit 1
    fi
}

OPT_ALL=--all-timestamps 

while [ $# -gt 0 ] ; do
    case "$1" in
        --)
            shift
            break
            ;;

        --max)
            shift
            OPT_MAX="--max $1"
            shift
            ;;

        --from)
            shift
            OPT_FROM="--from $1"
            OPT_ALL=""
            shift
            ;;

        --help)
            help
            ;;

        --*)
            help "unknown argument: $1"
            ;;

        *)
            break
            ;;
    esac
done

if [ $# != 1 ]
then
    help "<url> required"
fi

URL="$1"
    
if [ ! -d websites ]
then
    wayback_machine_downloader $OPT_ALL $OPT_MAX $OPT_FROM "$1"
fi

for FILE in $(find websites -type f)
do
    NUMBER=$(echo $FILE | sed -e '1 s|websites/[^/]*/\([^/]*\)/.*$|\1|')
    echo $NUMBER
    mv $FILE $NUMBER.html
done

rm -rf websites
