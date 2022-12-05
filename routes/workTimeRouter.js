const express = require( 'express' );
const router = express.Router();

const {
    getTodayWorkTime,
    checkIn,
    checkOut
} = require( '../controllers/workTime' );

// GET API
router.get( '/', getTodayWorkTime );

// POST API
router.post( '/checkIn', checkIn );
router.post( '/checkOut', checkOut );

module.exports = router;
