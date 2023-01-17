const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const checkIn = async (req, res) => {
  try {
    console.log("POST Check IN".bgBlue);
    const { EM_ID } = req.body;
    const today = new Date();
    const now = new Date(
      today.getTime() - today.getTimezoneOffset() * 60000
    ).toISOString();
    // check if employee already check in today
    const temp = await prisma.work_time_check.findFirst({
      where: {
        EM_ID,
        DATE : {
            gte: new Date(new Date(now).setHours(0, 0, 0, 0)),
        },
      },
    });


    if (!temp) {
      var isLate = false;
      // check checkIn later than 8:30
      const checkInTime = new Date(now);
      const checkInTimeHour = checkInTime.getUTCHours();
      const checkInTimeMinute = checkInTime.getMinutes();
      if (
        checkInTimeHour > 8 ||
        (checkInTimeHour == 8 && checkInTimeMinute > 30)
      )
        isLate = true;

      // create SQL Timestamp
      const Hour = checkInTime.getHours();
      const Minute = checkInTime.getMinutes();
      const Second = checkInTime.getSeconds();
      const Millisecond = checkInTime.getMilliseconds();
      const checkInTimeSQL = new Date(
        checkInTime.getFullYear(),
        checkInTime.getMonth(),
        checkInTime.getDate(),
        Hour,
        Minute,
        Second,
        Millisecond
      );

      const workTime = await prisma.work_time_check.create({
        data: {
          EM_ID,
          IS_LATE: isLate,
          DATE: checkInTimeSQL,
          IN_AT: checkInTimeSQL,
        },
      });
      console.log(`Employee ${EM_ID} check in at ${checkInTime}`.bgGreen);
      res.status(200).json({msg: "Check in success",data:workTime});
    } else {
      console.log(`Employee ${EM_ID} already check in `.bgGreen);
      res.status(200).json({msg: "Already check in",data:temp});
    }
  } catch (error) {
    console.log(`${error}`.red);
    res.status(500).json(error);
  }
};

const checkOut = async (req, res) => {
  try {
    console.log("POST Check OUT".bgBlue);
    const { EM_ID } = req.body;

    const today = new Date();
    const now = new Date(
      today.getTime() - today.getTimezoneOffset() * 60000
    ).toISOString();
    // check if employee already check out today

    // raw query check not check in today
    const temp = await prisma.$queryRaw`SELECT * FROM work_time_check WHERE EM_ID = ${EM_ID} AND \`DATE\` =DATE ORDER BY DATE DESC LIMIT 1`;
    if(!temp[0]){
        res.status(200).json({msg: "Not check in today"});
    }
    else{
      // raw query to get last check in and OUT_AT is null
      const temp2 = await prisma.$queryRaw`SELECT * FROM work_time_check WHERE EM_ID = ${EM_ID} AND \`DATE\` =DATE AND OUT_AT IS NULL ORDER BY DATE DESC LIMIT 1`;
      if (!!temp2[0]) {
        // check checkIn later than 8:30
        const checkOutTime = new Date(now);

        // create SQL Timestamp
        const Hour = checkOutTime.getHours();
        const Minute = checkOutTime.getMinutes();
        const Second = checkOutTime.getSeconds();
        const Millisecond = checkOutTime.getMilliseconds();
        const checkOutTimeSQL = new Date(
            checkOutTime.getFullYear(),
            checkOutTime.getMonth(),
            checkOutTime.getDate(),
            Hour,
            Minute,
            Second,
            Millisecond
        );


        // raw query for update out_at
        await prisma.$queryRaw`
                UPDATE work_time_check SET OUT_AT = ${checkOutTimeSQL} WHERE EM_ID = ${EM_ID} AND DATE >= ${new Date(
            new Date().setHours(0, 0, 0, 0)
        )}`;

        console.log(`Employee ${EM_ID} check out at ${checkOutTime}`.bgGreen);

        // select last check out
        const lastCheckOut = await prisma.$queryRaw`SELECT * FROM work_time_check WHERE EM_ID = ${EM_ID} AND \`DATE\` =DATE AND OUT_AT IS NOT NULL ORDER BY DATE DESC LIMIT 1`;

        res.status(200).json({msg: "Check out success",data:lastCheckOut});
      } else {
        console.log(`Employee ${EM_ID} already check out `.bgGreen);
        // select last check out
        const lastCheckOut = await prisma.$queryRaw`SELECT * FROM work_time_check WHERE EM_ID = ${EM_ID} AND \`DATE\` =DATE AND OUT_AT IS NOT NULL ORDER BY DATE DESC LIMIT 1`;
        res.status(200).json({msg: "Already check out",data:lastCheckOut});
      }
    }


  } catch (error) {
    console.log(`${error}`.red);
    res.status(500).json(error);
  }
};

const getTodayWorkTime = async (req, res) => {
  try {
    console.log("GET today work time".bgBlue);
    const workTime = await prisma.work_time_check.findMany({
      where: {
        IN_AT: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
      include: {
        employee: true,
      },
    });
    console.log("Sent today work time...".green);
    res.status(200).json(workTime);
  } catch (error) {
    console.log(`${error}`.red);
    res.status(500).json(error);
  }
};

module.exports = {
  getTodayWorkTime,
  checkIn,
  checkOut,
};
