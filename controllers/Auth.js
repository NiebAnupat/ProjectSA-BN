const { PrismaClient } = require( "@prisma/client" );
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");

const empLogin = async ( req, res ) => {
    // login with employee id and password and sent back token
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
                const token = jwt.sign( {
                    EM_ID : employee.EM_ID
                }, process.env.JWT_SECRET, {
                    expiresIn : '1h'
                } );
                console.log( 'Sent token...'.green );
                res.status( 200 ).json( token );
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
        console.log( 'POST hr login'.bgBlue );
        const { EM_ID, EM_PASSWORD } = req.body;
        const hr = await prisma.employee.findUnique( {
            where : {
                EM_ID : EM_ID,
            }
        } );
        if ( hr ) {
            if ( hr.EM_PASSWORD === EM_PASSWORD ) {
               // check if hr is hr
                if ( hr.DP_ID === 2 ) {
                    const token = jwt.sign( {
                        EM_ID : hr.EM_ID
                    }, process.env.JWT_SECRET, {
                        expiresIn : '1h'
                    } );
                    console.log( 'Sent token...'.green );
                    res.status( 200 ).json( token );
                }else {
                    console.log( 'Not HR'.red );
                    res.status( 200 ).json( null );
                }
            } else {
                console.log( 'Wrong password'.red );
                res.status( 200 ).json( null );
            }
        } else {
            console.log( 'HR not found'.red );
            res.status( 200 ).json( null );
        }
    } catch ( error ) {
        console.log( `${ error }`.red );
        res.status( 500 ).json( error );
    }
}

const auth = async ( req, res ) => {
    try {
        console.log( 'POST auth'.bgBlue );
        const { token } = req.body;
        const decoded = jwt.verify( token, process.env.JWT_SECRET );
        const employee = await prisma.employee.findUnique( {
            where : {
                EM_ID : decoded.EM_ID
            }
        } );
        if ( employee ) {
            console.log( 'Sent employee...'.green );
            res.status( 200 ).json( employee );
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
    hrLogin,
    auth
}
