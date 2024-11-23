
module.exports = {
  isAuthenticated: (req, res, next) => {
      if (req.session.userId || req.session.isGuest) {
          return next(); 
      }
      res.redirect('/login'); 
  },
  restrictGuests: (req, res, next) => {
      if (req.session.isGuest) {
          return res.redirect('/register'); 
      }
      next();
  },
};
