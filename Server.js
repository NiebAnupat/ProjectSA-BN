const express = require( "express" );
const cors = require( "cors" );
const colors = require( 'colors' );
require( "dotenv" ).config();
global.__basedir = __dirname;

const employeeRouter = require( "./routes/employeeRouter.js" );
const workTimeRouter = require( "./routes/workTimeRouter.js" );
const leaveWorkRouter = require( "./routes/leaveWorkRouter.js" );


const ejs = require( "ejs" );
const pdf = require( "html-pdf-node" );
const path = require( "path" );

const port = process.env.PORT || 3000;
const app = express();
app.use( express.json() );
app.use( express.urlencoded( { extended : true } ) );
const corsOptions = {
    origin : "http://localhost:3000",
    credentials : true,
};
app.use( cors( corsOptions ) );

app.use( "/employee", employeeRouter );
app.use( "/workTime", workTimeRouter );
app.use( "/leaveWork", leaveWorkRouter );

app.use( express.static( 'public' ) );

app.get( "/Logo.png", ( req, res ) => {
    res.sendFile( 'views/Logo.png', { root : __dirname } );
} )


const testPDF = async ( req, res ) => {
    console.log( "GET test pdf".bgBlue );
    console.log( 'Rendering PDF'.bgBlue );
    const data = {
        salary : '15000.00',
        sso : '1500.00',
        tax : '1500.00',
        totalIncome : '15000.00',
        netIncome : '15000.00',
        deductions : '15000.00',
        period : '2021-01-01 - 2021-01-31',
        paymentDate : '2021-01-31',
        month : 'January',
        employee : {
            EM_ID : '6400922',
            EM_FNAME : 'อนุภัทร',
            EM_LNAME : 'แก้วมี',
            department : {
                DP_NAME : 'ทรัพยากรบุคคล'
            },
        }
    }

    const options = {
        format : "legal",
        landscape : true,
        margin : {
            top : '25px',
            bottom : '25px',
            left : '25px',
            right : '25px'
        },
        printBackground : true,
        preferCSSPageSize : true,
    };

    const html = await ejs.renderFile( path.join( __dirname, "views", "paySlip.ejs" ), data, { async : true } );
    // res.send(html)
    const file = { content : html };
    pdf.generatePdf( file, options ).then( pdfBuffer => {
        res.writeHead( 200, {
            "Content-Type" : "application/pdf",
            // "Content-Disposition" : "attachment",
        } )
            .end( pdfBuffer );
    } ).catch( err => {
        console.log( `Error: ${ err }`.red );
        return res.status( 500 ).json( err );
    } )
}

app.get( "/", testPDF )

app.listen( port, () => {
    console.log( "Server is running...".cyan );
    console.log( `Listening on port ${ port }`.cyan );
} );


