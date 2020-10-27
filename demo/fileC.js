const logger = require("./fileD");

const logDate = text => {
  logger(`The date is: ${text}`);
};

module.exports =  logDate;
