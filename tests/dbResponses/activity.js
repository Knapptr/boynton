module.exports = {
  db: [
    {
      name: "Boating",
      id:100,
      period_id:100,
      description:"I'm on a boat!",
      camper_session_id: 100,
      is_present: false,
      camper_id: 100,
      first_name: "Boaty",
      last_name:"McBoatface",
      camper_activity_id: 100
    },{
      name: "Macaroni Art",
      id:100,
      period_id:100,
      description:"I'm on a boat!",
      camper_session_id: null,
      is_present: null,
      camper_id: null,
      first_name: null,
      last_name: null,
      camper_activity_id: null
    }
    ],
  repo: [
    {
      name: "Boating",
      id: 100,
      description: "I'm on a boat!",
      periodId: 100,
      campers: [
        {
          firstName: "Boaty",
          lastName: "McBoatface",
          sessionId: 100,
          id: 100,
          isPresent: false,
          camperId: 100,
        },
      ],
    },
    {
      name: "Macaroni art",
      description: null,
      periodId: 100,
      campers: [],
    },
  ],
};
