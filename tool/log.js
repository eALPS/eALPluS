const path = require("path")
const APP_ROOT = path.join(__dirname, "../")

const log_config = require('../config/log_config.json')
const lrs_config = require('../config/lrs_config.json')

const AppLogPath = log_config.app_log_path || path.join(APP_ROOT,'./logs/system/application.log')
const AppLogBackups = log_config.app_log_backups || 5
const ErrorLogPath = log_config.error_log_path || path.join(APP_ROOT,'./logs/system/error.log')
const ErrorLogBackups = log_config.error_log_backups || 5
const LearningLogPath = log_config.learning_log_path || path.join(APP_ROOT,'./logs/learning/data.log')
const LearningLogBackups = log_config.learning_log_backups || 5

const log4js = require('log4js')
log4js.configure({
  appenders: {
    out: { type: 'stdout' },
    app: { 
      'type': 'dateFile', 
      'filename': AppLogPath, 
      'pattern': '-yyyy-MM-dd',
      'backups': AppLogBackups,
      'compress': true
    },
    error: { 
      'type': 'dateFile', 
      'filename': ErrorLogPath, 
      'pattern': '-yyyy-MM-dd',
      'backups': ErrorLogBackups,
      'compress': true
    },
    learning: { 
      'type': 'dateFile', 
      'filename': LearningLogPath, 
      'pattern': '-yyyy-MM-dd',
      'backups': LearningLogBackups,
      'compress': true
    }
  },
  categories: {
    default: { appenders: ['out'], level: 'all' },
    app: { appenders: ['app'], level: 'debug' },
    error: { appenders: ['error'], level: 'debug' },
    learning: { appenders: ['learning'], level: 'info' },
  }
})

const loggerDefault = log4js.getLogger()
const loggerApp = log4js.getLogger('app')
const loggerError = log4js.getLogger('error')
const loggerLearning = log4js.getLogger('learning')

loggerApp.info("[eALPluS] started!!")

module.exports.default = loggerDefault
module.exports.app = loggerApp
module.exports.error = loggerError
module.exports.learning = loggerLearning


