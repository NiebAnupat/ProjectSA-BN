const { PrismaClient } = require( "@prisma/client" );
const prisma = new PrismaClient();

const empLogin = async ( req, res ) => {
    try {
        console.log( 'POST employee login'.bgBlue );
        const { EM_ID, EM_PASSWORD } = req.body;
        const employee = await prisma.employee.findUnique( {
            where : {
                EM_ID : EM_ID
            }
        } );
        if ( employee ) {
            if ( employee.EM_PASSWORD === EM_PASSWORD ) {
                console.log( 'Sent employee...'.green );
                res.status( 200 ).json( employee );
            } else {
                console.log( 'Wrong password'.red );
                res.status( 200 ).json( null );
            }
        } else {
            console.log( 'Employee not found'.red );
            res.status( 200 ).json( null );
        }
    } catch ( error ) {
        console.log( `${ error }`.red );
        res.status( 500 ).json( error );
    }
}

const hrLogin = async ( req, res ) => {
    try {
        console.log( 'POST employee login'.bgBlue );
        const { EM_ID, EM_PASSWORD } = req.body;
        const employee = await prisma.employee.findUnique( {
            where : {
                EM_ID : EM_ID
            }
        } );
        if ( employee ) {
            if ( employee.EM_PASSWORD === EM_PASSWORD ) {
                // Check if employee is in HR department (dp_id = 2)
                if ( employee.DP_ID === 2 ) {
                    console.log( 'Sent employee...'.green );
                    res.status( 200 ).json( employee );
                } else {
                    console.log( 'Not HR'.red );
                    res.status( 200 ).json( null );
                }
            } else {
                console.log( 'Wrong password'.red );
                res.status( 200 ).json( null );
            }
        } else {
            console.log( 'Employee not found'.red );
            res.status( 200 ).json( null );
        }
    } catch ( error ) {
        console.log( `${ error }`.red );
        res.status( 500 ).json( error );
    }
}

module.exports = {
    empLogin,
    hrLogin
}
