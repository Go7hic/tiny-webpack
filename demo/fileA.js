const returnDateTime = require("./fileB");
const logDate  = require("./fileC");

const main = () => {
  const date = returnDateTime();
  logDate(date);
};

main();
