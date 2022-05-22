const Activity = require("./activity");

Activity.get(2).then((a) => {
	console.log(a);
	a.getCampers().then((c) => console.log(c));
});
