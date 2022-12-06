const fs = require( "fs" );
const { PrismaClient } = require( "@prisma/client" );
const moment = require( "moment/moment" );
const prisma = new PrismaClient();

const leaveWork = async ( req, res ) => {
    try {
        console.log( 'POST leaveWork'.bgBlue );
        const { EM_ID, L_TYPE_NAME, L_DATE_START, L_DATE_END, L_NOTE } = req.body;
        let img = null;
        if ( req.file !== undefined ) {
            img = fs.readFileSync(
                __basedir + "/assets/uploads/" + req.file.filename
            )
        }
        // find leave type id
        const leaveType = await prisma.leave_type.findFirst( {
            where : {
                LY_NAME : L_TYPE_NAME
            }
        } )

        const L_TYPE = leaveType.LY_ID;


        // check if employee has enough leave days
        const leave_remaining = await prisma.leave_remaining.findFirst( {
            where : {
                EM_ID : EM_ID,
                L_TYPE : L_TYPE
            },
        } )

        // get amount of days
        const date1 = new Date( L_DATE_START );
        const date2 = new Date( L_DATE_END );
        const diffTime = Math.abs( date2 - date1 );
        let diffDays = Math.ceil( diffTime / (1000 * 60 * 60 * 24) ) + 1;

        // if diffDays = 0 then diffDays = 1
        if ( diffDays === 0 ) diffDays = 1;


        if ( leave_remaining ) {
            if ( leave_remaining.LR_REMAIN_DATE < diffDays ) {
                return res.json( null )
            }
        } else {
            //get max date of leave type
            const leaveTypeMaxDate = await prisma.leave_type.findUnique( {
                where : {
                    LY_ID : L_TYPE
                },
            } )
            const maxDate = leaveTypeMaxDate.LY_MAX_DATE;
            if ( maxDate < diffDays ) {
                return res.json( null )
            }
        }

        const leaveWork = await prisma.leave_work.create( {
            data : {
                EM_ID,
                L_TYPE,
                L_DATE_START : new Date( moment( L_DATE_START ).format( 'YYYY-MM-DD' ) ),
                L_DATE_END : new Date( moment( L_DATE_END ).format( 'YYYY-MM-DD' ) ),
                L_NOTE,
                L_IMAGE : img
            }
        } )


        if ( leaveWork ) {
            console.log( "leaveWork and leaveRemaining created".green );
            res.status( 200 ).json( leaveWork );
        } else return res.json( null )


    } catch ( error ) {
        console.log( `${ error }`.red );
        return res.status( 500 )
    }
}

const getAllLeaveWork = async ( req, res ) => {
    try {
        console.log( 'GET all leaveWork'.bgBlue );
        const leaveWork = await prisma.leave_work.findMany( {
            include : {
                employee : true,
                leave_type : true
            },
            orderBy : {
                L_ID : 'desc'
            }
        } );
        console.log( 'sent all leaveWork...'.green );
        res.status( 200 ).json( leaveWork );
    } catch ( error ) {
        res.status( 500 ).json( error );
    }
}

const getLeaveWork = async ( req, res ) => {
    try {
        console.log( 'GET leaveWork'.bgBlue );
        const { id } = req.params;
        const leaveWork = await prisma.leave_work.findMany( {
            where : {
                EM_ID : id
            },
            include : {
                employee : {
                    include : {
                        department : true
                    }
                },
                leave_type : true
            },
            orderBy : {
                L_ID : 'desc'
            }
        } );
        console.log( 'Sent leaveWork...'.green );
        res.status( 200 ).json( leaveWork );
    } catch ( error ) {
        console.log( `${ error }`.red );
        res.status( 500 ).json( error );
    }
}

const getPendingLeaveWork = async ( req, res ) => {
    try {
        console.log( 'GET pending leaveWork'.bgBlue );
        const leaveWork = await prisma.leave_work.findMany( {
            where : {
                L_STATUS : 'p'
            },
            include : {
                employee : {
                    include : {
                        department : true
                    }
                },
                leave_type : true
            },
            orderBy : {
                L_ID : 'desc'
            }
        } );
        console.log( 'Sent pending leaveWork...'.green );
        res.status( 200 ).json( leaveWork );
    } catch ( error ) {
        console.log( `${ error }`.red );
        res.status( 500 ).json( error );
    }
}

const getApprovedLeaveWork = async ( req, res ) => {
    try {
        console.log( 'GET approved leaveWork'.blue );
        const leaveWork = await prisma.leave_work.findMany( {
            where : {
                L_STATUS : 't'
            },
            include : {
                employee : true,
                leave_type : true
            },
            orderBy : {
                L_ID : 'desc'
            }
        } );


        console.log( 'Sent approved leaveWork...'.green );
        res.status( 200 ).json( leaveWork );
    } catch ( error ) {
        console.log( `${ error }`.red );
        res.status( 500 ).json( error );
    }
}

const getRejectedLeaveWork = async ( req, res ) => {
    try {
        console.log( 'GET rejected leaveWork'.bgBlue );
        const leaveWork = await prisma.leave_work.findMany( {
            where : {
                L_STATUS : 'f'
            },
            include : {
                employee : true,
                leave_type : true
            },
            orderBy : {
                L_ID : 'desc'
            }
        } );
        console.log( 'Sent rejected leaveWork...'.green );
        res.status( 200 ).json( leaveWork );
    } catch ( error ) {
        console.log( `${ error }`.red );
        res.status( 500 ).json( error );
    }
}

const getTodayApprovedLeaveWork = async ( req, res ) => {
    try {
        console.log( 'GET today approved leaveWork'.bgBlue );
        const leaveWork = await prisma.leave_work.findMany( {
            where : {
                L_STATUS : 't',
                L_DATE_START : {
                    lte : new Date( moment().format( 'YYYY-MM-DD' ) )
                },
                L_DATE_END : {
                    gte : new Date( moment().format( 'YYYY-MM-DD' ) )
                }
            },
            include : {
                employee : {
                    include : {
                        department : true,
                        position : true
                    }
                },
                leave_type : true
            },
            orderBy : {
                L_ID : 'desc'
            }
        } );
        console.log( 'Sent today approved leaveWork...'.green );
        res.status( 200 ).json( leaveWork );
    } catch ( error ) {
        console.log( `${ error }`.red );
        res.status( 500 ).json( error );
    }
}

const approveLeaveWork = async ( req, res ) => {
    try {
        console.log( 'PUT approve leaveWork'.bgBlue );
        const { id } = req.params;
        const leaveWork = await prisma.leave_work.update( {
            where : {
                L_ID : parseInt( id )
            },
            data : {
                L_STATUS : 't'
            },
            include : {
                employee : true,
                leave_type : true
            }
        } );

        const { employee, leave_type } = leaveWork
        console.log( leaveWork )
        const { EM_ID } = employee
        const { LY_ID } = leave_type

        //get max date of leave type
        const leaveTypeMaxDate = await prisma.leave_type.findFirst( {
            where : {
                LY_ID : LY_ID
            },
        } )

        // get amount of days
        const date1 = new Date( leaveWork.L_DATE_START );
        const date2 = new Date( leaveWork.L_DATE_END );
        const diffTime = Math.abs( date2 - date1 );
        let diffDays = Math.ceil( diffTime / (1000 * 60 * 60 * 24) ) + 1;

        // if diffDays = 0 then diffDays = 1
        if ( diffDays === 0 ) diffDays = 1;


        // update or create leave remaining as raw query
        const leaveRemaining = await prisma.$queryRaw`INSERT INTO leave_remaining (EM_ID, L_TYPE, LR_REMAIN_DATE) VALUES (${ EM_ID }, ${ LY_ID }, ${ leaveTypeMaxDate.LY_MAX_DATE - diffDays }) ON DUPLICATE KEY UPDATE LR_REMAIN_DATE = ${ leaveTypeMaxDate.LY_MAX_DATE - diffDays }`
        if ( leaveWork && leaveRemaining ) {
            console.log( 'LeaveWork approved...'.green );
            res.status( 200 ).json( leaveWork );
        } else res.json( null )
    } catch ( error ) {
        console.log( `${ error }`.red );
        res.status( 500 ).json( error );
    }
}

const rejectLeaveWork = async ( req, res ) => {
    try {
        console.log( 'PUT reject leaveWork'.bgBlue );
        const { id } = req.params;
        const leaveWork = await prisma.leave_work.update( {
            where : {
                L_ID : parseInt( id )
            },
            data : {
                L_STATUS : 'f'
            }
        } );
        console.log( 'LeaveWork rejected...'.green );
        res.status( 200 ).json( leaveWork );
    } catch ( error ) {
        console.log( `${ error }`.red );
        res.status( 500 ).json( error );
    }
}

module.exports = {
    leaveWork,
    getAllLeaveWork,
    getLeaveWork,
    getPendingLeaveWork,
    getApprovedLeaveWork,
    getRejectedLeaveWork,
    getTodayApprovedLeaveWork,
    approveLeaveWork,
    rejectLeaveWork
}
