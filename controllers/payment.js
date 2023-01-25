const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const ejs = require("ejs");
const pdf = require("html-pdf-node");
const fs = require("fs");
const PDFMerger = require('pdf-merger-js');
const moment = require("moment/moment");

const createPaySlip = async (req, res) => {
  try {
    console.log("POST create pay slip".bgBlue);
    const { EM_ID } = req.params;
    // check if employee has payment in this month
    const payment = await prisma.pay_slip.findFirst({
      where: {
        EM_ID: EM_ID,
        PS_DATE: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
        },
      },
      include: {
        employee: {
          include: {
            department: true,
            position: true,
          },
        },
      },
    });

    // if not, create new payment

    if (payment) {
      // render pay slip

      console.log(`Employee ${EM_ID} has payment in this month`.bgGreen);
      const ps = payment;

      // get today as string
      const today = new Date();
      const todayString = today.toISOString().split("T")[0];
      // get month in pay slip
      const payDate = new Date(ps.PS_DATE);
      const month = payDate.getMonth() + 1;
      const year = payDate.getFullYear();

      // frist day of month
      const firstDay = new Date(year, month - 1, 1);
      // last day of month
      const lastDay = new Date(year, month, 0);

      // frist day of month and last day of month as string
      const firstDayString = firstDay.toISOString().split("T")[0];
      const lastDayString = lastDay.toISOString().split("T")[0];

      const Period = firstDayString + " - " + lastDayString;
      //get month  as string
      const monthString = today.toLocaleString("default", { month: "long" });

      const data = {
        salary: ps.employee.EM_SALARY,
        sso: ps.PS_SSO,
        tax: ps.PS_TAX,
        totalIncome: ps.totalIncome,
        netIncome: ps.PS_NET_SALARY,
        deductions: ps.PS_SSO + ps.PS_TAX,
        period: Period,
        paymentDate: moment(ps.PS_DATE).format("DD/MM/YYYY"),
        month: moment(ps.PS_DATE).format("MM/YYYY"),
        employee: ps.employee,
      };

      const options = {
        format: "legal",
        landscape: true,
        margin: {
          top: "25px",
          bottom: "25px",
          left: "25px",
          right: "25px",
        },
        printBackground: true,
        preferCSSPageSize: true,
      };

      const html = await ejs.renderFile(
        `${__basedir}/views/paySlip.ejs`,
        data,
        { async: true }
      );
      // res.send(html)
      const file = { content: html };
      pdf
        .generatePdf(file, options)
        .then((pdfBuffer) => {
          res
            .writeHead(200, {
              "Content-Type": "application/pdf",
              "Content-Disposition": "attachment",
              filename: "paySlip.pdf",
            })
            .end(pdfBuffer);
        })
        .catch((err) => {
          console.log(`Error: ${err}`.red);
          return res.status(500).json(err);
        });
    }
    else {
      // get employee salary
      const employee = await prisma.employee.findUnique({
        where: {
          EM_ID: EM_ID,
        },
      });

      const salary = employee.EM_SALARY;

      // calculate SSO 5% from salary, Max salary 15000
      var sso = 0;
      if (salary > 15000) sso = 15000 * 0.05;
      else sso = salary * 0.05;

      // calculate tax 3% from salary
      var tax = salary * 0.03;
      const Deductions = sso + tax;
      // calculate net salary
      var netIncome = salary - Deductions;
      // create pay slip
      const paySlip = await prisma.pay_slip.create({
        data: {
          EM_ID,
          PS_SSO: sso,
          PS_TAX: tax,
          PS_NET_SALARY: netIncome,
        },
      });

      console.log("Created pay slip...".green);
      console.log(`Pay slip for employee ${EM_ID} created`.green);

      // get last pay slip
      const lastPaySlip = await prisma.pay_slip.findFirst({
        where: {
          EM_ID: EM_ID,
        },
        orderBy: {
          PS_ID: "desc",
        },
        include: {
          employee: {
            include: {
              department: true,
              position: true,
            },
          },
        },
      });

      console.log("Render pay slip...".green);

      // get month in pay slip
      const payDate = new Date(lastPaySlip.PS_DATE);
      const month = payDate.getMonth() + 1;
      const year = payDate.getFullYear();

      // frist day of month
      const firstDay = new Date(year, month - 1, 1);
      // last day of month
      const lastDay = new Date(year, month, 0);

      // frist day of month and last day of month as string
      const firstDayString = firstDay.toISOString().split("T")[0];
      const lastDayString = lastDay.toISOString().split("T")[0];

      const Period = firstDayString + " - " + lastDayString;

      // get today as string
      const today = new Date();
      const todayString = today.toISOString().split("T")[0];

      //get month  as string
      const monthString = today.toLocaleString("default", { month: "long" });

      // make .00
      const salaryString = salary.toFixed(2);
      const ssoString = sso.toFixed(2);
      const taxString = tax.toFixed(2);
      const netIncomeString = netIncome.toFixed(2);
      const DeductionsString = Deductions.toFixed(2);

      const data = {
        salary: salaryString,
        sso: ssoString,
        tax: taxString,
        totalIncome: salaryString,
        netIncome: netIncomeString,
        deductions: DeductionsString,
        period: Period,
        paymentDate: moment(lastPaySlip.PS_DATE).format("DD/MM/YYYY"),
        month: moment(lastPaySlip.PS_DATE).format("MM/YYYY"),
        employee: lastPaySlip.employee,
      };

      const options = {
        format: "legal",
        landscape: true,
        margin: {
          top: "25px",
          bottom: "25px",
          left: "25px",
          right: "25px",
        },
        printBackground: true,
        preferCSSPageSize: true,
      };

      const html = await ejs.renderFile(
        `${__basedir}/views/paySlip.ejs`,
        data,
        { async: true }
      );
      // res.send(html)
      const file = { content: html };
      pdf
        .generatePdf(file, options)
        .then((pdfBuffer) => {
          res
            .writeHead(200, {
              "Content-Type": "application/pdf",
              "Content-Disposition": "attachment",
              filename: "paySlip.pdf",
            })
            .end(pdfBuffer);
        })
        .catch((err) => {
          console.log(`Error: ${err}`.red);
          return res.status(500).json(err);
        });
    }
  } catch (error) {
    console.log(`${error}`.red);
    res.status(500).json(error);
  }
};

const createAllPaySlips = async (req, res) => {
  // create All Pay Slips For All Employees
  try {
    console.log("POST create all pay slips".bgBlue);
    // const HR_ID = parseInt(req.body.EM_ID);

    // get HR Name
    // const HR = await prisma.employee.findUnique( {
    //     where : {
    //         EM_ID : HR_ID
    //     }
    // })
    //
    // const HRFName = HR.EM_FNAME;
    // const HRLName = HR.EM_LNAME;
    // const HRName = HRFName + "  " + HRLName;
    //

    const employees = await prisma.employee.findMany({
      where: {
        EM_IS_ACTIVATE: true,
      },
      include: {
        pay_slip: true,
      },
    });
    for (let i = 0; i < employees.length; i++) {
      // check if employee has pay slip for this month
      const employee = employees[i];
      const EM_ID = employee.EM_ID;
      const paySlips = employee.pay_slip;
      const today = new Date();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();
      var hasPaySlip = false;
      for (let j = 0; j < paySlips.length; j++) {
        const paySlip = paySlips[j];
        const payDate = new Date(paySlip.PS_DATE);
        const payMonth = payDate.getMonth() + 1;
        const payYear = payDate.getFullYear();
        if (month == payMonth && year == payYear) {
          hasPaySlip = true;
          break;
        }
      }
      if (hasPaySlip) {
        console.log(`Employee ${EM_ID} has pay slip for this month`.green);
        continue;
      }
      console.log(`Creating pay slip for employee ${employee.EM_ID}`.green);
      const salary = employee.EM_SALARY;
      // calculate SSO 5% from salary, Max salary 15000
      var sso = 0;
      if (salary > 15000) sso = 15000 * 0.05;
      else sso = salary * 0.05;

      // calculate tax 3% from salary
      var tax = salary * 0.03;
      const Deductions = sso + tax;
      // calculate net salary
      var netIncome = salary - Deductions;
      // create pay slip
      const paySlip = await prisma.pay_slip.create({
        data: {
          EM_ID,
          PS_SSO: sso,
          PS_TAX: tax,
          PS_NET_SALARY: netIncome,
        },
      });

      console.log("Created pay slip...".green);
      console.log(`Pay slip for employee ${EM_ID} created`.green);
    }
    // res.status( 200 ).json( "All pay slips created" );
    // get pdf as one file

    const paySlips = await prisma.pay_slip.findMany({
      where: {
        PS_DATE: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      include: {
        employee: {
          include: {
            department: true,
            position: true,
          },
        },
      },
    });

    // loop render all pay slips
    for (const item of paySlips) {
      await renderToPDF(item);
    }

    const merger = new PDFMerger();
    // read pdf files from folder and add to merger
    const files = fs.readdirSync(`${__basedir}/public/pdfs`);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // file is allPaySlips.pdf or paySlip.pdf so skip it
      if (file == "allPaySlips.pdf" || file == "paySlip.pdf") continue;
      await merger.add(`${__basedir}/public/pdfs/${file}`);
    }

    // merge pdf files
    await merger.save(`${__basedir}/public/pdfs/allPaySlips.pdf`);

    // send pdf file
    await res.download(`${__basedir}/public/pdfs/allPaySlips.pdf`);

    // after sending file delete it
    // fs.unlinkSync( `${ __basedir }/public/pdfs/allPaySlips.pdf` );
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file == "allPaySlips.pdf" || file == "paySlip.pdf") continue;
      fs.unlinkSync(`${__basedir}/public/pdfs/${file}`);
    }
  } catch (error) {
    // console.log( `${ error }`.red );
    console.log(error);
    res.status(500).json(error);
  }

  async function renderToPDF(ps) {
    const payDate = new Date(ps.PS_DATE);
    const month = payDate.getMonth() + 1;
    const year = payDate.getFullYear();

    // frist day of month
    const firstDay = new Date(year, month - 1, 1);
    // last day of month
    const lastDay = new Date(year, month, 0);

    // frist day of month and last day of month as string
    const firstDayString = firstDay.toISOString().split("T")[0];
    const lastDayString = lastDay.toISOString().split("T")[0];

    const Period = firstDayString + " - " + lastDayString;

    // get today as string
    const today = new Date();
    const todayString = new Date(
      today.getTime() - today.getTimezoneOffset() * 60000
    )
      .toISOString()
      .split("T")[0];

    //get month  as string
    const monthString = today.toLocaleString("default", { month: "long" });

    // make .00
    const salaryString = ps.employee.EM_SALARY.toFixed(2);
    const ssoString = ps.PS_SSO.toFixed(2);
    const taxString = ps.PS_TAX.toFixed(2);
    const netIncomeString = ps.PS_NET_SALARY.toFixed(2);
    const DeductionsString = (ps.PS_SSO + ps.PS_TAX).toFixed(2);

    const data = {
      salary: salaryString,
      sso: ssoString,
      tax: taxString,
      totalIncome: salaryString,
      netIncome: netIncomeString,
      deductions: DeductionsString,
      period: Period,
      paymentDate: moment(ps.PS_DATE).format("DD/MM/YYYY"),
      month: moment(ps.PS_DATE).format("MM/YYYY"),
      employee: ps.employee,
    };

    const options = {
      format: "legal",
      landscape: true,
      margin: {
        top: "25px",
        bottom: "25px",
        left: "25px",
        right: "25px",
      },
      printBackground: true,
      preferCSSPageSize: true,
    };

    const html = await ejs.renderFile(`${__basedir}/views/paySlip.ejs`, data, {
      async: true,
    });
    // res.send(html)
    const file = { content: html };
    const pdfBuffer = await pdf.generatePdf(file, options);

    // save pdf to file
    fs.writeFileSync(
      `${__basedir}/public/pdfs/paySlip-${
        ps.employee.EM_ID
      }-${new Date().getTime()}.pdf`,
      pdfBuffer
    );
  }
};

module.exports = {
  createPaySlip,
  createAllPaySlips,
};
