const express = require( 'express' );
const router = express.Router();
const upload = require( '../middleware/upload' );

// import employee controller
const {
    getEmployees,
    getEmployee,
    updateEmployee
} = require( '../controllers/employee' );

// GET API
router.get( '/all', getEmployees );
router.get( '/by/:id', getEmployee );

// PUT API
router.put( '/:id', upload.single( 'EM_IMAGE' ), updateEmployee );


module.exports = router;

// export default router;
