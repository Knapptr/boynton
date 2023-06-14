export function isAdmin(auth) {
  return auth.userData.user.role === "admin"
}

export function isUnitHead(auth) {
  console.log("Checking if unithead",{auth});
  return isAdmin(auth) || auth.userData.user.role === "unit_head"
}

export function isProgramming(auth) {
  return isAdmin(auth) || isUnitHead(auth) || auth.userData.user.role === "programming"
}

