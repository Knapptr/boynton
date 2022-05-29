SELECT 
cw.id,
cw.camper_id,c.first_name,c.last_name,c.age,c.gender,
w.number as week_number,w.title as week_title,
cw.cabin_session_id,cab.name as cabin_name
ca.id as activity_id,ca.period_id,
a.name, a.description

FROM camper_weeks cw
JOIN weeks w ON w.number = cw.week_id
LEFT JOIN cabin_sessions cs ON cs.id = cw.cabin_session_id
LEFT JOIN cabins cab ON cab.name = cs.cabin_name
JOIN campers c ON c.id = cw.camper_id
LEFT JOIN camper_activities ca ON ca.camper_week_id = cw.id
LEFT JOIN activities a ON a.id = ca.activity_id
