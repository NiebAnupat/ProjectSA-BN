const app = require("./index");
const http = require("http");

http.createServer(app).listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
