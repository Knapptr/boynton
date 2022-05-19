#AWARDER

## What should it do?

-   Supplied with a list of First and Last names, and what award to give each, create a singular PDF file of a weeks worth of camp leslie awards

-   parse from a spreadsheet the awards?
-   parse from csv

## Slack Integration?

-   command like `/award (area) (for): (list)` where `area` is the program area, `list ` is a list of space separated First Last name pairs. and `for` is the title of the award.

_EG_: `/award arts Yarn-Bombing: Tyler Knapp Anja Golden`

would add 2 awards to the arts sheet for Yarn bombing, for Tyler Knapp and Anja Golden.

-   command like `/printawards` will fill in all templates and return a .pdf to the requestor.

-   have API endpoint that allows for easy desktop printing?

## Flow

-   Parse command from slack
-   Add to spreadsheet
-   Recieve print request (takes 'Week X' where X is number of week)
-   Pull info from google sheets
-   ~~Turn all .pptx into pdf files~~ _This is not possible as it stands at the moment without major dependancies_
-   fill in pdf templates with data
-   Merge pdf files into single file titled 'Week X Awards'
-   delete individual .pdf files
-   return singular .pdf file to requestor
-   delete singular .pdf file

## Data

**Award Row In Sheet**
| column | description |
| --- | --- |
| programArea | what program area does the award belong to? |
| for | what is the award for? |
| first | first name of award recipient |
| last | last name of award recipient |

## How does it work?

### spreadsheet creation

-   _user sends award command_
-   parse user arguments
-   add names to spreadsheet as necessary

### template filling

-   _admin reviews spreadsheet_
-   _admin sends run command_
-   data collected from spreadsheet
-   data organized by awardType
-   collections of awardType organized by awardFor
-   fill in templates
-   convert all to pdf
-   remove .pptx files
-   create single pdf file
-   remove individual pdf files
-   send user .pdf
-   delete .pdf file

## TODO

-   Input correct week automatically
-   Add award comments?
-   Add camp managment lists
