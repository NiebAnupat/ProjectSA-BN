const express = require( 'express' );
const router = express.Router();

const {
    empLogin,
    hrLogin
} = require( '../controllers/auth' );

// POST API
router.post( '/login', empLogin );
router.post( '/hrLogin', hrLogin );

module.exports = router;
