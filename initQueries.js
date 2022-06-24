module.exports = { 
camperWeeks:`
  CREATE TABLE IF NOT EXISTS camper_weeks
  (
  id integer NOT NULL DEFAULT nextval('camper_weeks_id_seq'::regclass),
  week_id integer NOT NULL,
  camper_id integer NOT NULL,
  cabin_session_id integer,
  CONSTRAINT camper_weeks_pkey PRIMARY KEY (id),
  CONSTRAINT one_week_per_camper UNIQUE (week_id, camper_id),
  CONSTRAINT cabin_assignment FOREIGN KEY (cabin_session_id)
  REFERENCES public.cabin_sessions (id) MATCH SIMPLE
  ON UPDATE SET NULL
  ON DELETE SET NULL
  NOT VALID,
  CONSTRAINT camper_id FOREIGN KEY (camper_id)
  REFERENCES public.campers (id) MATCH SIMPLE
  ON UPDATE NO ACTION
  ON DELETE CASCADE
  NOT VALID
  )
`,
camperActivities:`
  CREATE TABLE IF NOT EXISTS camper_activities
  (
  id integer NOT NULL DEFAULT nextval('camper_periods_id_seq'::regclass),
  camper_week_id integer NOT NULL DEFAULT nextval('camper_periods_camper_id_seq'::regclass),
  activity_id integer NOT NULL DEFAULT nextval('camper_periods_activity_id_seq'::regclass),
  period_id integer NOT NULL,
  is_present boolean NOT NULL DEFAULT false,
  CONSTRAINT camper_periods_pkey PRIMARY KEY (id),
  CONSTRAINT one_activity_per_camper UNIQUE (period_id, camper_week_id),
  CONSTRAINT camper_session_ids FOREIGN KEY (camper_week_id)
  REFERENCES public.camper_weeks (id) MATCH SIMPLE
  ON UPDATE CASCADE
  ON DELETE CASCADE
  NOT VALID,
  CONSTRAINT "same " FOREIGN KEY (activity_id, period_id)
  REFERENCES public.activities (id, period_id) MATCH SIMPLE
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
  id integer NOT NULL DEFAULT nextval('activity_id_seq'::regclass),
  period_id integer NOT NULL DEFAULT nextval('activity_period_id_seq'::regclass),
  CONSTRAINT activity_pkey PRIMARY KEY (id),
  CONSTRAINT no_duplicates UNIQUE (name, period_id),
  CONSTRAINT p UNIQUE (period_id, id),
  CONSTRAINT period_id FOREIGN KEY (period_id)
  REFERENCES public.periods (id) MATCH SIMPLE
  ON UPDATE CASCADE
  ON DELETE CASCADE
  NOT VALID
  )
  `,
 cabinSessions:`
  CREATE TABLE IF NOT EXISTS public.cabin_sessions
  (
  id integer NOT NULL DEFAULT nextval('cabin_sessions_id_seq'::regclass),
  week_id integer NOT NULL DEFAULT nextval('cabin_sessions_week_id_seq'::regclass),
  cabin_name character varying COLLATE pg_catalog."default",
  CONSTRAINT cabin_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT "one camper cabin assigment per week" UNIQUE (week_id, cabin_name),
  CONSTRAINT cabin_id FOREIGN KEY (cabin_name)
  REFERENCES public.cabins (name) MATCH SIMPLE
  ON UPDATE CASCADE
  ON DELETE CASCADE
  NOT VALID,
  CONSTRAINT week FOREIGN KEY (week_id)
  REFERENCES public.weeks ("number") MATCH SIMPLE
  ON UPDATE CASCADE
  ON DELETE CASCADE
  NOT VALID
  )
    `}
