const { PrismaClient } = require( "@prisma/client" );
const prisma = new PrismaClient();
const dayjs = require( 'dayjs' );

const checkIn = async ( req, res ) => {
    try {
        console.log( "POST Check IN".bgBlue );
        const { EM_ID } = req.body;

        const today = new Date()
        const now = (new Date( today.getTime() - today.getTimezoneOffset() * 60000 ).toISOString())
        // check if employee already check in today
        const temp = await prisma.work_time_check.findFirst( {
            where : {
                EM_ID,
                IN_AT : {
                    gte : new Date( new Date().setHours( 0, 0, 0, 0 ) )
                }
            }
        } )

        if ( !temp ) {
            var isLate = false;
            // check checkIn later than 8:30
            const checkInTime = new Date( now );
            const checkInTimeHour = checkInTime.getUTCHours()
            const checkInTimeMinute = checkInTime.getMinutes()
            const checkInTimeSecond = checkInTime.getUTCSeconds();
            const checkInTimeMillisecond = checkInTime.getUTCMilliseconds();
            if ( checkInTimeHour > 8 || (checkInTimeHour == 8 && checkInTimeMinute > 30) ) isLate = true;

            // create SQL Timestamp
            const Hour = checkInTime.getHours();
            const Minute = checkInTime.getMinutes();
            const Second = checkInTime.getSeconds();
            const Millisecond = checkInTime.getMilliseconds();
            const checkInTimeSQL = new Date( checkInTime.getFullYear(), checkInTime.getMonth(), checkInTime.getDate(), Hour, Minute, Second, Millisecond );

            const workTime = await prisma.work_time_check.create( {
                data : {
                    EM_ID,
                    IS_LATE : isLate,
                    DATE : checkInTimeSQL,
                    IN_AT : checkInTimeSQL,
                }
            } );
            console.log( `Employee ${ EM_ID } check in at ${ checkInTime }`.bgGreen );
            res.status( 200 ).json( workTime );
        } else {
            console.log( `Employee ${ EM_ID } already check in `.bgGreen );
            res.status( 200 ).json( temp );
        }
    } catch ( error ) {
        console.log( `${ error }`.red );
        res.status( 500 ).json( error );
    }
}

const checkOut = async ( req, res ) => {
    try {
        console.log( "POST Check OUT".bgBlue );
        const { EM_ID } = req.body;

        const today = new Date()
        const now = (new Date( today.getTime() - today.getTimezoneOffset() * 60000 ).toISOString())
        // check if employee already check out today
        const temp = await prisma.work_time_check.findFirst( {
            where : {
                EM_ID,
                OUT_AT : {
                    gte : new Date( new Date().setHours( 0, 0, 0, 0 ) )
                }
            }
        } )

        if ( !temp ) {
            // check checkIn later than 8:30
            const checkOutTime = new Date( now );

            // create SQL Timestamp
            const Hour = checkOutTime.getHours();
            const Minute = checkOutTime.getMinutes();
            const Second = checkOutTime.getSeconds();
            const Millisecond = checkOutTime.getMilliseconds();
            const checkOutTimeSQL = new Date( checkOutTime.getFullYear(), checkOutTime.getMonth(), checkOutTime.getDate(), Hour, Minute, Second, Millisecond );

            // const workTime = await prisma.work_time_check.update( {
            //     where : {
            //         EM_ID,
            //         DATE : {
            //             gte : new Date( new Date().setHours( 0, 0, 0, 0 ) )
            //         }
            //     },
            //     data : {
            //         OUT_AT : checkInTimeSQL,
            //     }
            // } )

            // raw query for update out_at
            const workTime = await prisma.$queryRaw`
                UPDATE work_time_check SET OUT_AT = ${ checkOutTimeSQL } WHERE EM_ID = ${ EM_ID } AND DATE >= ${ new Date( new Date().setHours( 0, 0, 0, 0 ) ) }`

            console.log( `Employee ${ EM_ID } check out at ${ checkOutTime }`.bgGreen );
            res.status( 200 ).json( workTime );
        } else {
            console.log( `Employee ${ EM_ID } already check out `.bgGreen );
            res.status( 200 ).json( temp );
        }
    } catch ( error ) {
        console.log( `${ error }`.red );
        res.status( 500 ).json( error );
    }
}

const getTodayWorkTime = async ( req, res ) => {
    try {
        console.log( "GET today work time".bgBlue );
        const workTime = await prisma.work_time_check.findMany( {
            where : {
                IN_AT : {
                    gte : new Date( new Date().setHours( 0, 0, 0, 0 ) )
                }
            },
            include : {
                employee : true
            }
        } );
        console.log( "Sent today work time...".green );
        res.status( 200 ).json( workTime );
    } catch ( error ) {
        console.log( `${ error }`.red );
        res.status( 500 ).json( error );
    }
}


module.exports = {
    getTodayWorkTime,
    checkIn,
    checkOut
}
