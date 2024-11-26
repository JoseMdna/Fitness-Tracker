function isAuthenticated(req, res, next) {
  if (req.session.userId) {
      return next();
  }
  if (req.session.isGuest) {
      return res.redirect('/register');
  }
  res.redirect('/login');
}

function restrictGuests(req, res, next) {
  if (req.session.isGuest && !req.session.userId) {
      return res.status(403).send('Guests are not allowed to perform this action.');
  }
  next();
}

module.exports = {
  isAuthenticated,
  restrictGuests,
};