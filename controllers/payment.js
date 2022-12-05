const { PrismaClient } = require( "@prisma/client" );
const prisma = new PrismaClient();

const ejs = require("ejs");
const pdf = require("html-pdf");
const path = require("path");

const createPaySlip = async ( req, res ) => {
    try {
        console.log( "POST create pay slip".bgBlue );
        const { EM_ID } = req.body;

        // get employee salary
        const employee = await prisma.employee.findUnique( {
            where : {
                EM_ID : EM_ID
            }
        } )

        const salary = employee.EM_SALARY;

        // calculate SSO 5% from salary, Max salary 15000
        var sso = 0;
        if ( salary > 15000 ) sso = 15000 * 0.05;
        else sso = salary * 0.05;

        // คำนวนภาษีเงินได้ส่วนบุคคลต่อเดือนแบบขั้นบันได
        // var tax = 0;
        // var SalaryPerYear = salary * 12;
        // var temp = 0;
        // const exceptTaxPerMonth = 150000
        //
        // if ( SalaryPerYear <= exceptTaxPerMonth ) tax += 0;
        // SalaryPerYear -= exceptTaxPerMonth;
        // temp += exceptTaxPerMonth;
        // if ( SalaryPerYear > 150000 && SalaryPerYear <= 300000 ) tax += SalaryPerYear * 0.05;
        // SalaryPerYear -= temp;
        // temp += 150000;
        // if ( SalaryPerYear > 300000 && SalaryPerYear <= 500000 ) tax += SalaryPerYear * 0.1;
        // SalaryPerYear -= temp;
        // temp += 200000;
        // if ( SalaryPerYear > 500000 && SalaryPerYear <= 750000 ) tax += SalaryPerYear * 0.15;
        // SalaryPerYear -= temp;
        // temp += 250000;
        // if ( SalaryPerYear > 750000 && SalaryPerYear <= 1000000 ) tax += SalaryPerYear * 0.2;
        // SalaryPerYear -= temp;
        // temp += 250000;
        // if ( SalaryPerYear > 1000000 && SalaryPerYear <= 2000000 ) tax += SalaryPerYear * 0.25;
        // SalaryPerYear -= temp;
        // temp += 1000000;
        // if ( SalaryPerYear > 2000000 && SalaryPerYear <= 5000000 ) tax += SalaryPerYear * 0.3;
        // SalaryPerYear -= temp;
        // temp += 3000000;
        // if ( SalaryPerYear > 5000000 ) tax += SalaryPerYear * 0.35;
        // SalaryPerYear -= temp;
        // temp += 3000000;
        //
        // tax = tax / 12;

        // calculate tax 3% from salary
        var tax = salary * 0.03;

        const Deductions = sso + tax;


        // calculate net salary
        var netIncome = salary - Deductions

        // create pay slip
        const paySlip = await prisma.pay_slip.create( {
            data : {
                EM_ID,
                PS_SSO : sso,
                PS_TAX : tax,
                PS_NET_SALARY : netIncome
            }
        } )

        console.log( "Created pay slip...".green );
        console.log( `Pay slip for employee ${ EM_ID } created`.green );

        // get last pay slip
        const lastPaySlip = await prisma.pay_slip.findFirst( {
            where : {
                EM_ID : EM_ID
            },
            orderBy : {
                PS_ID : "desc"
            },
            include : {
                employee : {
                    include : {
                        department : true,
                        position : true
                    }
                }
            }
        } )

        // get month in pay slip
        const payDate = new Date( lastPaySlip.PY_DATE );
        const month = payDate.getMonth() + 1;
        const year = payDate.getFullYear();

        // frist day of month
        const firstDay = new Date( year, month - 1, 1 );
        // last day of month
        const lastDay = new Date( year, month, 0 );

        // frist day of month and last day of month as string
        const firstDayString = firstDay.toISOString().split( "T" )[0];
        const lastDayString = lastDay.toISOString().split( "T" )[0];

        const Period = firstDayString + " - " + lastDayString;

        // get today as string
        const today = new Date();
        const todayString = today.toISOString().split( "T" )[0];

        //get month  as string
        const monthString = today.toLocaleString( 'default', { month : 'long' } );

        // make .00
        const salaryString = salary.toFixed( 2 );
        const ssoString = sso.toFixed( 2 );
        const taxString = tax.toFixed( 2 );
        const netIncomeString = netIncome.toFixed( 2 );
        const DeductionsString = Deductions.toFixed( 2 );

        res.render( "paySlip.ejs", {
            salary : salaryString,
            sso : ssoString,
            tax : taxString,
            totalIncome : salaryString,
            netIncome : netIncomeString,
            deductions : DeductionsString,
            period : Period,
            paymentDate : todayString,
            month : monthString,
            employee : lastPaySlip.employee
        } );

        ejs.renderFile( path.join( __dirname, "../views/", "paySlip.ejs" ),{
            salary : salaryString,
            sso : ssoString,
            tax : taxString,
            totalIncome : salaryString,
            netIncome : netIncomeString,
            deductions : DeductionsString,
            period : Period,
            paymentDate : todayString,
            month : monthString,
            employee : lastPaySlip.employee
        }, ( err, data ) => {
            if ( err ) res.send( err );
            else {
                const options = {
                    "format" : "Legal",
                    "orientation" : "landscape",
                    "border" : "10mm"
                };

                pdf.create( data, options ).toFile( `./public/payslips/${ lastPaySlip.PS_ID }.pdf`, function ( err, data ) {
                    if ( err ) res.send( err );
                    else console.log( "PDF created...".green );
                } );
            }
        })


        res.status( 200 ).json( paySlip );
    } catch ( error ) {
        console.log( `${ error }`.red );
        res.status( 500 ).json( error );
    }
}


module.exports = {
    createPaySlip
}
