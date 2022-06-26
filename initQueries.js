module.exports = { 
camperWeeks:`
  CREATE TABLE IF NOT EXISTS camper_weeks
  (
  id serial NOT NULL  ,
  week_id integer NOT NULL,
  camper_id integer NOT NULL,
  cabin_session_id integer,
  CONSTRAINT camper_weeks_pkey PRIMARY KEY (id),
  CONSTRAINT one_week_per_camper UNIQUE (week_id, camper_id),
  CONSTRAINT cabin_assignment FOREIGN KEY (cabin_session_id)
  REFERENCES cabin_sessions (id) MATCH SIMPLE
  ON UPDATE SET NULL
  ON DELETE SET NULL
  NOT VALID,
  CONSTRAINT camper_id FOREIGN KEY (camper_id)
  REFERENCES campers (id) MATCH SIMPLE
  ON UPDATE NO ACTION
  ON DELETE CASCADE
  NOT VALID
  )
`,
camperActivities:`
  CREATE TABLE IF NOT EXISTS camper_activities
  (
  id serial NOT NULL  ,
  camper_week_id integer NOT NULL ,
  activity_id varchar(8) NOT NULL,
  period_id integer NOT NULL,
  is_present boolean NOT NULL DEFAULT false,
  CONSTRAINT camper_periods_pkey PRIMARY KEY (id),
  CONSTRAINT one_activity_per_camper UNIQUE (period_id, camper_week_id),
  CONSTRAINT camper_session_ids FOREIGN KEY (camper_week_id)
  REFERENCES camper_weeks (id) MATCH SIMPLE
  ON UPDATE CASCADE
  ON DELETE CASCADE
  NOT VALID,
  CONSTRAINT "same" FOREIGN KEY (activity_id, period_id)
  REFERENCES activities (id, period_id) MATCH SIMPLE
  ON UPDATE CASCADE
  ON DELETE CASCADE
  NOT VALID
  )
`,
cabins: `
  CREATE TABLE IF NOT EXISTS cabins
  (
  name character varying(255) COLLATE pg_catalog."default" NOT NULL,
  capacity integer NOT NULL,
  area character varying(2) COLLATE pg_catalog."default",
  CONSTRAINT cabins_pkey PRIMARY KEY (name)
  )
`,
activities:`
  CREATE TABLE IF NOT EXISTS activities
  (
  name character varying(255) COLLATE pg_catalog."default" NOT NULL,
  description character varying(255) COLLATE pg_catalog."default",
  id varchar(6) NOT NULL ,
  period_id integer NOT NULL ,
  CONSTRAINT activities_pkey PRIMARY KEY (id),
  CONSTRAINT no_duplicates UNIQUE (name, period_id),
  CONSTRAINT p UNIQUE (period_id, id),
  CONSTRAINT period_id FOREIGN KEY (period_id)
  REFERENCES periods (id) MATCH SIMPLE
  ON UPDATE CASCADE
  ON DELETE CASCADE
  NOT VALID
  )
  `,
 cabinSessions:`
  CREATE TABLE IF NOT EXISTS cabin_sessions
  (
  id serial NOT NULL  ,
  week_id integer NOT NULL  ,
  cabin_name character varying COLLATE pg_catalog."default",
  CONSTRAINT cabin_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT "one camper cabin assigment per week" UNIQUE (week_id, cabin_name),
  CONSTRAINT cabin_id FOREIGN KEY (cabin_name)
  REFERENCES cabins (name) MATCH SIMPLE
  ON UPDATE CASCADE
  ON DELETE CASCADE
  NOT VALID,
  CONSTRAINT week FOREIGN KEY (week_id)
  REFERENCES weeks ("number") MATCH SIMPLE
  ON UPDATE CASCADE
  ON DELETE CASCADE
  NOT VALID
  )
    `}
