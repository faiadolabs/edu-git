// const { git_path } = require('../helpers/git');
const { createLogger } = require('../helpers/logger');

// https://www.npmjs.com/package/dotenv?activeTab=readme
require('dotenv').config()

// Middlewares: https://github.com/yargs/yargs/blob/main/docs/advanced.md#middleware
const logging = (argv) => {
    const homedir = require('os').homedir();
    const log_path = process.env.LOG_PATH ? process.env.LOG_PATH : `${homedir}/.config/edu-git/logs/`;

    createLogger(argv, log_path);
    // return git_path()
    //     .then( ({ topLevel }) => createLogger(argv, topLevel) )
    //     .then( () => {} ) // Esto es lo que voy a retornar si toda va bien
    //     .catch( err => {
    //         getLogger().error(err.message);
    //         process.exit(1);
    //     })
}

module.exports = {
    logging,
}