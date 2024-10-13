#!/usr/bin/env node
const yargs = require('yargs');
const { fetch } = require('./handlers/edu-git-fetch-handler');
const { logging } = require('./middleware/logging');
const i18n = require('./helpers/translator');

// Define una función asíncrona principal. Necesaria por asincronía
const main = async () => {
    // procesa argumentos y ejecuta comando
    const argv = await yargs
        .middleware(logging)
        .scriptName("edu-git-fetch")
        .usage('$0 [options]')
        .count('verbose')
        .alias('v', 'verbose')
        .alias('s', "silent")
        .options({
            'p': {
                alias: 'prefix',
            },
            'b': {
                alias: 'branch'
            },
        })
        .strict()
        .demandCommand(0, i18n.__('Debes especificar un comando'))
        .help()
        .argv

        fetch(argv);
}

main();
