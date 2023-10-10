const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

logger.info('Starting your application...'); 



function logQueryExecution(queryObj) {
  logger.info(`Executing query: ${queryObj.query}, Args: [${queryObj.args.join(', ')}], Event: ${queryObj.event}`);
}

function logQueryError(queryObj, error) {
  logger.error(`Error executing query: ${queryObj.query}, Args: [${queryObj.args.join(', ')}], Event: ${queryObj.event}, Error: ${error}`);
}


function logQuerySuccess(queryObj) {
    logger.info(`Query executed successfully: ${queryObj.query}, Args: [${queryObj.args.join(', ')}], Event: ${queryObj.event}`);
  }

module.exports = {
logger,
logQueryError,
logQueryExecution,
logQuerySuccess
}