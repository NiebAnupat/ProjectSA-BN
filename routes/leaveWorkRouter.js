const express = require( 'express' );
const router = express.Router();
const upload = require( '../middleware/upload' );

// import leaveWork controller
const {
    leaveWork,
    getAllLeaveWork,
    getLeaveWork,
    getPendingLeaveWork,
    getApprovedLeaveWork,
    getRejectedLeaveWork,
    getTodayApprovedLeaveWork,
    approveLeaveWork,
    rejectLeaveWork
} = require( '../controllers/leaveWork' );

// GET API
router.get( '/all', getAllLeaveWork );
router.get( '/pending', getPendingLeaveWork );
router.get( '/approved', getApprovedLeaveWork );
router.get( '/rejected', getRejectedLeaveWork );
router.get( '/todayApproved', getTodayApprovedLeaveWork );
router.get( '/by/:id', getLeaveWork );

// POST API
router.post( '/',upload.single('image'), leaveWork );

// PUT API
router.put( '/approve/:id', approveLeaveWork );
router.put( '/reject/:id', rejectLeaveWork );

module.exports = router;
