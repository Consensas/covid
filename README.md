# covid

 ![Consensas_Logo](https://consensas-aws.s3.amazonaws.com/email-201910/Consensas-Black.png) 

=======
# Data Visualizations 
(Google Sheets + Charts + Consensas Data) are now available [here](https://docs.google.com/spreadsheets/d/1BxT6W3RgnkJvJRyJhFQ-43SfUEKg-p5iYBgQCGa-jOY/edit) 

# covid
COVID-2019 data / code

The primary purpose of this project is to provide useful data about cases, deaths and recovery of COVID19 in Canada 
and merge that with information such as population, ICU capacity and so forth.

Visualizations and Google Sheets version 
[here](https://docs.google.com/spreadsheets/d/1BxT6W3RgnkJvJRyJhFQ-43SfUEKg-p5iYBgQCGa-jOY/edit?usp=sharing)

## Notes

Code is a demonstration of Pipe Oriented Programming in NodeJS.

Think of it as an attempt to do a "Wolfram Language" type hypercompatible set of libaries for working with data and the world.
Look at the code in `data/datasets` for getting a sense of what it does.

[Consensas](https://www.consensas.com/) is our startup, credit to them / us for taking time away from that to work on this. **Our goal during the pandemic is to create a public, normalized, semantically well-defined dataset. Our concern is a lack of data, loss of data**

Generally we name data as follow:

* *bootstrap* data is usually data loaded eg from Wayback machine, to set up a dataset
* *raw* data is usually YAML/JSON pulled or built from another source, but otherwise nothing else has been done to it
* *cooked* data has been normalized to the data schema describe below. This is usually what you want to look at.
* *pull* programs get raw data from elsewhere
* *cook* programs merge or process data to create cooked data

## Data Organization

The primary "cooked" data can be found in folder `data/cooked`
[here on the web](https://github.com/consensas/covid/tree/master/data/cooked).
There is cooked data elsewhere but unless noted, it's been merged into this data set.
The files we have spent the most work on are `ca-??.yaml`.

* If you would like to contribute data, do the usual fork
  and submit a change request.
* If you know of a dataset I should add, open an issue.
* If you think I should add something but can't find it, sorry busy.
* The *primary* purpose of this project is Canada, but there's data
  for the rest of the world there too. If you do the coding legwork,
  I'm happy to add it but I don't have the time otherwise.

## Data Sources

### COVID CSSEGISandData

This is the primary source of data and should get primary credit.
We will pull it daily. 

* https://github.com/CSSEGISandData/COVID-19/tree/master/csse_covid_19_data

### COVID-19 Canada Open Data Working Group

COVID-19 Canada Open Data Working Group. Epidemiological Data from the COVID-19 Outbreak in Canada.

We've got the their data set, but have not merged into the cooked data yet.
You can find this in `data/ca.cases`

See their original data at
* https://docs.google.com/spreadsheets/d/1D6okqtBS3S2NRC7GFVHzaZ67DuTw7LX49-fqSLwJyeo/edit#gid=411012049
* https://github.com/ishaberry/Covid19Canada


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
* QC

- `tests`: the number of tests performed / underway
- `tests_negative`
- `tests_positive`
- `tests_resolved`: patient is no longer infectious
- `tests_ordered`

### Timeline of events

Data by Consenas

- `event_close_bars`: bars have been ordered to shut down
- `event_close_restaurants`: restaurants have been ordered to shutdown (excluding restuarants)
- `event_close_takeout`: takeout services have been ordered to shutdown
- `event_close_school_public`: public shcools have been ordered to shutdown
- `event_close_school_private`: private schools have been ordered to shutdown
- `event_close_postsecondary`: postsecondary have been ordered to shutdown
- `event_close_daycare`: daycares have been ordered to shutdown
- `event_close_stores`: stores have been ordered to shutdown
- `event_close_faith`: faith servies have been ordered to shutdown
- `event_close_libraries`: libraries have been ordered to shutdown

- `event_ban_groups_1000`: groups bigger than 1000 should not meet
- `event_ban_groups_500`: groups bigger than 500 should not meet
- `event_ban_groups_250`: groups bigger than 250 should not meet
- `event_ban_groups_150`: groups bigger than 150 should not meet
- `event_ban_groups_100`: groups bigger than 100 should not meet
- `event_ban_groups_50`: groups bigger than 50 should not meet

- `event_emergency`: state of emergency / public health emergency declared
- `event_shutdown`: general shutdown of everything (eg Italy level)

### Political

This dataset we created using lots of Google Searching

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

Article on open data sources
* https://www.cbc.ca/news/canada/coronavirus-date-information-sharing-1.5500709?fbclid=IwAR2Hds42iyOoCEijeoDxIEz_tTidbme15DKkTcV6bi5YGM5JwfEk3w9fPYQ

Our World in Data: Data Set
* https://covid.ourworldindata.org/data/ecdc/full_data.csv

