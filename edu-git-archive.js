#!/usr/bin/env node
const yargs = require('yargs');
const { archive } = require('./handlers/edu-git-archive-handler');
const { logging } = require('./middleware/logging');
const i18n = require('./helpers/translator');

// Define una función asíncrona principal. Necesaria por asincronía
const main = async () => {
    // procesa argumentos y ejecuta comando
    const argv = await yargs
        .middleware(logging)
        .scriptName("edu-git-archive")
        .example('$0 --remote COURSE2425 --yes --no-fetch', i18n.__('edu_git_archive.ejemplos.ejemplo1'))
        .usage('$0 --remote <prefix | alias> [options]')
        .count('verbose')
        .alias('h', 'help')
        .options({
            'y': {
                alias: "yes",
                describe: i18n.__("responde 'sí' para ejecución no interactiva"),
                type: yargs.boolean,
            },
            'r': {
                alias: "remote",
                describe: i18n.__('alias o prefijo de este, de los repositorios remotos a archivar'),
                type: 'string',
                demandOption: true,
            },
            'b': {
                alias: 'branch',
                describe: i18n.__('nombre o prefijo del nombre de la/s rama/s remota/s a archivar'),
                type: 'string',
            },
            'f': {
                alias: 'fetch',
                describe: i18n.__('Fuerza el actualizado de las referencias remotas'),
                type: yargs.boolean,
                default: false,
            }
            // 'b': {
            //     alias: 'branch'
            // },
        })
        .strict()
        // .demandCommand(0, i18n.__('Debes especificar un comando'))
        .help()
        .argv

        archive(argv);
}

main();