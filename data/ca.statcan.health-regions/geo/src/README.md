# Source

https://www150.statcan.gc.ca/n1/pub/82-402-x/2015001/reg-eng.htm

The user guide can be found at:

https://www150.statcan.gc.ca/n1/pub/82-402-x/2015001/gui-eng.htm#a5

# Conversion

The MapInfo files were converted into geojson files using ogr2ogr. For
example, the Ontario health region mapinfo file was converted as follows:

$ ogr2ogr -f "GeoJSON" HRP035b11m_e_Oct2013.geojson HRP035b11m_e_Oct2013.TAB -t_srs EPSG:4326

Each of the resulting geojson files were quite large (ranging from 2.2M
to 195M). To reduce space they were then downsampled using https://mapshaper.org/.

Each file was imported using the default settings. They were simplified
using the "Visvalingam / effective area" method with a 10% setting.