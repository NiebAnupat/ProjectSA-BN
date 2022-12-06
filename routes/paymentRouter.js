const express = require( 'express' );
const router = express.Router();

const {createPaySlip,createAllPaySlips} = require('../controllers/payment');

router.get( '/by/:EM_ID', createPaySlip );
router.get( '/all', createAllPaySlips );

module.exports = router;
