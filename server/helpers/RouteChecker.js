/**
 * check if user logged in
 */
function requiresLogin(req, res, next) {
  if (!req.me) {
    return res.status(401).end();
  }
  return next();
}

module.exports = { requiresLogin };
