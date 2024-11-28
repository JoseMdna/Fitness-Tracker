const Activity = require('../../models/Activity')

async function validateOwnership(req, res, next) {
    try {
        const activity = await Activity.findById(req.params.id)
        if (!activity) {
            return res.status(404).send('Activity not found')
        }
        if (activity.userId.toString() !== req.session.userId) {
            return res.status(403).send('You do not have permission to access this activity')
        }
        req.activity = activity
        next()
    } catch (error) {
        res.status(500).send('Internal Server Error')
    }
}

module.exports = { validateOwnership }