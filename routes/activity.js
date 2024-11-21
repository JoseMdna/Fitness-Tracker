const { isAuthenticated } = require('../middleware/auth');

router.get('/activities', isAuthenticated, (req, res) => {
 
});
