# covid
COVID-2019 data / code

The primary purpose of this project is to provide useful
data about cases, deaths and recovery of COVID19 in Canada 
and merge that with information such as population,
ICU capacity and so forth.

## Notes

Code is a demonstration of Pipe Oriented Programming in NodeJS. 
Think of it as an attempt to do a "Wolfram Language" type
hypercompatible set of libaries for working with data and the world.
Look at the code in `data/datasets` for getting a sense of 
what it does.

[Consensas](https://www.consensas.com/) is my startup, credit to 
them / us for taking time away from that to work on this.

Generally we name data as follow:

* *bootstrap* data is usually data loaded eg from Wayback machine, to set up a dataset
* *raw* data is usually YAML/JSON pulled or built from another source,
  but otherwise nothing else has been done to it
* *cooked* data has been normalized to the data schema describe below.
  This is usually what you want to look at.
* *pull* programs get raw data from elsewhere
* *cook* programs merge or process data to create cooked data

## Data Organization

The primary "cooked" data can be found in folder `data/cooked`
[here on the web](https://github.com/consensas/covid/tree/master/data/cooked).
There is cooked data elsewhere but unless noted, 
it's been merged into this data set.
The files we have spent the most work on are `ca-??.yaml`.

* If you would like to contribute data, do the usual fork
  and submit a change request.
* If you know of a dataset I should add, open an issue.
* If you think I should add something but can't find it, sorry busy.
* The *primary* purpose of this project is Canada, but there's data
  for the rest of the world there too. If you do the codingh legwork,
  I'm happy to add it but I don't have the time otherwise.

## Data Sources

### COVID CSSEGISandData

This is the primary source of data and should get primary credit.
We will pull it daily. 

* https://github.com/CSSEGISandData/COVID-19/tree/master/csse_covid_19_data

### Physicians 

* https://www.cma.ca/sites/default/files/pdf/Physician%20Data/12-Phys_per_pop.pdf

Keys:

* `doctors_pp` - doctors per person

### ICU capacity

Note that this data does break out the Territories, so that
data is not merged yet.

* https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4426537/ (table 1)

Keys:

* `icu_hospitals` - Hospitals with ICUs with ventilation capacity
* `icu_beds` - ICU beds capable of invasive ventilation
* `icu_ventalators` - Ventilators capable of invasive ventilation
* `icu_hfov` - High-frequency oscillatory ventilators
* `icu_hospitals_ino` - Hospitals with ICUs with iNO
* `icu_hospitals_ecmo` - Hospitals with ICUs with ECMO

### Spending

* https://www.cihi.ca/en/how-do-the-provinces-and-territories-compare

Keys:

* `spending_pp` - spending per person

### Age Brackets and Population

From Stats Can 2019 dataset

* https://www150.statcan.gc.ca/t1/tbl1/en/cv.action?pid=1710000501#timeframe

Keys:

- `population`: the population
- `age_median`: median age
- `age_XX_YY`: population aged XX to YY
- `age_XX_up`: population aged XX and up

### Testing

This retrieved by scraping, and may be spotty.
These provinces are in the data set:

* ON
* BC
* AB
* SK
* MB
* NS
* PE (starts 2020-03-17)
* NB

- `tests`: the number of tests performed / underway
- `tests_negative`
- `tests_positive`
- `tests_resolved`: patient is no longer infectious
- `tests_ordered`

### Political

This dataset I created myself using lots of Google Searching

- `poli_leader`: eg the premier
- `poli_leader_health`: eg the minister of health
- `poli_officer_cmo`: chief medical officer
- `poli_covid_url`: address of provincial COVID19 website

## Geographical Naming

* https://github.com/lukes/ISO-3166-Countries-with-Regional-Codes
* https://github.com/vlucas/devdata.io/tree/master/datasets

## Discontinued

### Population

This is as close to "from some Internet rando" as it gets.
I hope to replace with StatsCan data soon.

* https://github.com/Clavicus/Testing-Requests

Keys:

* `population`

## Other

Similar project for Ontario data:
* https://github.com/Russell-Pollari/ontario-covid19

Kaggle challange
* https://www.kaggle.com/allen-institute-for-ai/CORD-19-research-challenge?utm_medium=email&utm_source=intercom&utm_campaign=CORD-19-research-chal-email
