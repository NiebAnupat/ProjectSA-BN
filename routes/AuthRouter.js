const express = require( 'express' );
const router = express.Router();

const {
    empLogin,
    hrLogin,
    auth
} = require( '../controllers/auth' );

// POST API
router.post( '/login', empLogin );
router.post( '/hrLogin', hrLogin );
router.post( '/auth', auth );



module.exports = router;
