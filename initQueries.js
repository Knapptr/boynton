module.exports = {
  users: `
    CREATE TABLE IF NOT EXISTS users
    (
    username character varying(24) NOT NULL,
    password character varying(255) NOT NULL,
    first_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    role character varying(255) NOT NULL DEFAULT 'counselor'::character varying,
    lifeguard bool NOT NULL DEFAULT false,
    archery bool NOT NULL DEFAULT false,
    senior bool NOT NULL DEFAULT false,
    first_year bool NOT NULL DEFAULT false,
    ropes bool NOT NULL DEFAULT false,
    CONSTRAINT users_pkey PRIMARY KEY (username)
    )`,

  camperWeeks: `
  CREATE TABLE IF NOT EXISTS camper_weeks
  (
  id serial NOT NULL  ,
  week_id integer NOT NULL,
  camper_id integer NOT NULL,
  day_camp boolean DEFAULT false,
  fl boolean DEFAULT false,
  cabin_session_id integer,
  CONSTRAINT camper_weeks_pkey PRIMARY KEY (id),
  CONSTRAINT one_week_per_camper UNIQUE (week_id, camper_id),
  CONSTRAINT cabin_assignment FOREIGN KEY (cabin_session_id)
  REFERENCES cabin_sessions (id) 
  ON UPDATE SET NULL
  ON DELETE SET NULL,
  CONSTRAINT camper_id FOREIGN KEY (camper_id)
  REFERENCES campers (id) 
  ON UPDATE NO ACTION
  ON DELETE CASCADE
  )
`,
  camperActivities: `
  CREATE TABLE IF NOT EXISTS camper_activities
  (
  id serial NOT NULL  ,
  camper_week_id integer NOT NULL ,
  activity_id integer NOT NULL,
  period_id integer NOT NULL,
  is_present boolean NOT NULL DEFAULT false,
  CONSTRAINT camper_periods_pkey PRIMARY KEY (id),
  CONSTRAINT one_activity_per_camper UNIQUE (period_id, camper_week_id),
  CONSTRAINT camper_session_ids FOREIGN KEY (camper_week_id)
  REFERENCES camper_weeks (id) 
  ON UPDATE CASCADE
  ON DELETE CASCADE,
  CONSTRAINT act_session_id FOREIGN KEY (activity_id)
  REFERENCES activity_sessions (id)
  ON UPDATE CASCADE
  ON DELETE CASCADE,
  CONSTRAINT "same" FOREIGN KEY (activity_id, period_id)
  REFERENCES activity_sessions (id, period_id) 
  ON UPDATE CASCADE
  ON DELETE CASCADE
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
  activitySessions: `
  CREATE TABLE IF NOT EXISTS activity_sessions
  (
  id serial NOT NULL ,
  period_id integer NOT NULL ,
  activity_id integer NOT NULL,
  CONSTRAINT act_sess_p_key PRIMARY KEY (id),
  CONSTRAINT activity_id FOREIGN KEY (activity_id) REFERENCES activities (id)
  ON UPDATE CASCADE
  ON DELETE CASCADE,
  CONSTRAINT no_duplicates UNIQUE (period_id, activity_id),
  CONSTRAINT p UNIQUE (period_id, id),
  CONSTRAINT period_id FOREIGN KEY (period_id) REFERENCES periods (id)
  ON UPDATE CASCADE
  ON DELETE CASCADE
  )
  `,
  activities: `
  CREATE TABLE IF NOT EXISTS activities (
  id serial NOT NULL UNIQUE,
  name character varying(255) NOT NULL UNIQUE,
  description character varying(255) COLLATE pg_catalog."default",
  CONSTRAINT act_pkey PRIMARY KEY (id)
  )

  `,
  cabinSessions: `
  CREATE TABLE IF NOT EXISTS cabin_sessions
  (
  id serial NOT NULL  ,
  week_id integer NOT NULL  ,
  cabin_name character varying COLLATE pg_catalog."default",
  CONSTRAINT cabin_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT "one camper cabin assigment per week" UNIQUE (week_id, cabin_name),
  CONSTRAINT cabin_id FOREIGN KEY (cabin_name)
  REFERENCES cabins (name) 
  ON UPDATE CASCADE
  ON DELETE CASCADE,
  CONSTRAINT week FOREIGN KEY (week_id)
  REFERENCES weeks ("number") 
  ON UPDATE CASCADE
  ON DELETE CASCADE
  )`,

  staffActivities: `
  CREATE TABLE IF NOT EXISTS staff_activities
  (
  id serial NOT NULL,
  staff_session_id integer NOT NULL,
  period_id integer NOT NULL,
  activity_session_id integer NOT NULL,
  CONSTRAINT staffAct_pkey PRIMARY KEY (id),
  CONSTRAINT "one staff assignment per period" UNIQUE (period_id, staff_session_id),
  CONSTRAINT f_act_s FOREIGN KEY (activity_session_id) REFERENCES activity_sessions (id)
  ON UPDATE CASCADE
  ON DELETE CASCADE,
  CONSTRAINT period_id FOREIGN KEY (period_id) REFERENCES periods (id)
  ON UPDATE CASCADE
  ON DELETE CASCADE,
  CONSTRAINT staff_sess_relation FOREIGN KEY (staff_session_id) REFERENCES staff_sessions (id)
  ON UPDATE CASCADE
  ON DELETE CASCADE
  )
  `,


  staffSession: `
  CREATE TABLE IF NOT EXISTS staff_sessions(
    id serial NOT NULL,
    week_number integer NOT NULL,
    username CHARACTER VARYING NOT NULL,
    CONSTRAINT pkey_staff_session PRIMARY KEY (id),
    CONSTRAINT week_relation FOREIGN KEY (week_number) REFERENCES weeks (number)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
    CONSTRAINT user_relation FOREIGN KEY (username) REFERENCES users (username)
    ON UPDATE CASCADE
    ON DELETE CASCADE
  )
`,

  programAreas: `
  CREATE TABLE IF NOT EXISTS program_areas(
    id serial NOT NULL PRIMARY KEY,
    name CHARACTER VARYING NOT NULL
  )
  `,
  awards: `
  CREATE TABLE IF NOT EXISTS awards(
    id serial NOT NULL PRIMARY KEY,
    camper_session_id INTEGER NOT NULL,
    program_area_id INTEGER NOT NULL,
    reason CHARACTER VARYING NOT NULL,
    CONSTRAINT fk_camper_session_id FOREIGN KEY (camper_session_id) REFERENCES camper_weeks(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE ,
    CONSTRAINT fk_program_area FOREIGN KEY (program_area_id) REFERENCES program_areas(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
  )
  `

}

