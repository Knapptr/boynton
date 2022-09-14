# Boynton
## What does it do?
- Assign campers to cabins
- Sign campers up for activities
- Take attendance
- Manage weekly awards
- Track team scores

## How
- Campers are pulled from a .csv report, and maintained in a postgres database
- Activities managed in a Google sheet for easy access and review- and synced to the postgres db
- Cabins,Weeks,Days,Periods are all setup in a config.json
- Awards are tracked in a Google sheet - enabling easy review by any staff member with access to the sheet.
- Awards are given in slack
- Scores are awarded in slack
- Awards are created in slack
  - Boynton fills out all appropriate award templates, merges them to a single Google slides file, and shares the file with the print-requestor


