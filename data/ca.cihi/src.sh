#
#
#

cd $(dirname $0)
[ ! -d src ] && mkdir src
curl 'https://www.cihi.ca/sites/default/files/document/beds-staffed-and-in-operation-2017-2018-en-web-revmay3.xlsx' > src/beds.xlsx
curl 'https://www.cihi.ca/sites/default/files/document/icu_datatables_en.xlsx' > src/icu.xlsx
