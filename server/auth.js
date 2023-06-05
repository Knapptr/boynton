const JwtStrategy = require("passport-jwt").Strategy;
const extractJwt = require("passport-jwt").ExtractJwt;
const User = require("../models/User");

const options = {
	secretOrKey: process.env.JWT_SECRET,
	jwtFromRequest: extractJwt.fromAuthHeaderAsBearerToken(),
};

module.exports = (passport) => {
	passport.use(
		new JwtStrategy(options, async (jwt_payload, done) => {
			try {
				const user = await User.get(jwt_payload.username);
				// console.log("Request made by:",{ user });
				if (!user) {
					return done(null, false);
				}
				return done(null, user);
			} catch (e) {
				return done(e);
			}
		})
	);
};
