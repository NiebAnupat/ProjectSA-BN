const fs = require("fs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const moment = require("moment");

const getEmployees = async (req, res) => {
  try {
    console.log("GET all employees".bgBlue);
    const employees = await prisma.employee.findMany({
      where: {
        EM_IS_ACTIVATE: true,
      },
      include: {
        department: true,
        position: true,
      },
    });
    console.log("Sent all employees...".green);
    res.status(200).json(employees);
  } catch (error) {
    console.log(`${error}`.red);
    res.status(500).json(error);
  }
};

const getEmployee = async (req, res) => {
  try {
    console.log("GET employee".bgBlue);
    const { id } = req.params;
    const employee = await prisma.employee.findUnique({
      where: {
        EM_ID: id,
      },
      include: {
        department: true,
        position: true,
      },
    });
    console.log("Sent employee...".green);
    res.status(200).json(employee);
  } catch (error) {
    console.log(`${error}`.red);
    res.status(500).json(error);
  }
};

const updateEmployee = async (req, res) => {
  try {
    console.log("PUT employee".bgBlue);
    console.log(req.body);
    const { id } = req.params;
    const {
      EM_FNAME,
      EM_LNAME,
      EM_ADDRESS,
      EM_TEL,
      DP_NAME,
      P_NAME,
      EM_SALARY,
      EM_IS_ACTIVATE,
    } = req.body;

    let img = null;
    if (req.file) {
      img = fs.readFileSync(__basedir + "/assets/uploads/" + req.file.filename);
    }

    // find department id
    const department = await prisma.department.findFirst({
      where: {
        DP_NAME: DP_NAME,
      },
    });
    const DP_ID = department.DP_ID;

    // find position id
    const position = await prisma.position.findFirst({
      where: {
        P_NAME: P_NAME,
      },
    });
    const P_ID = position.P_ID;

    var employee = null;
    if (img) {
      employee = await prisma.employee.update({
        where: {
          EM_ID: id,
        },
        data: {
          EM_FNAME,
          EM_LNAME,
          EM_ADDRESS,
          EM_TEL,
          DP_ID,
          P_ID,
          EM_SALARY: parseFloat(EM_SALARY),
          EM_IS_ACTIVATE: EM_IS_ACTIVATE === "true",
          EM_IMAGE: img,
          EM_CHANGE_AT: new Date(moment().format("YYYY-MM-DD HH:mm:ss")),
        },
      });
    } else {
      employee = await prisma.employee.update({
        where: {
          EM_ID: id,
        },
        data: {
          EM_FNAME,
          EM_LNAME,
          EM_ADDRESS,
          EM_TEL,
          DP_ID,
          P_ID,
          EM_SALARY: parseFloat(EM_SALARY),
          EM_IS_ACTIVATE: EM_IS_ACTIVATE === "true",
          EM_CHANGE_AT: new Date(moment().format("YYYY-MM-DD HH:mm:ss")),
        },
      });
    }

    console.log("Employee updated...".green);
    res.status(200).json(employee);

    // delete file
    if (req.file) {
      fs.unlinkSync(__basedir + "/assets/uploads/" + req.file.filename);
    }
  } catch (error) {
    console.log(`${error}`.red);
    res.status(500).json(error);
  }
};

module.exports = {
  getEmployees,
  getEmployee,
  updateEmployee,
};
