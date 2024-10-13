#!/usr/bin/env node
const { add, remove } = require('./handlers/edu-git-remote-handler');
const yargs = require('yargs');

const { logging } = require('./middleware/logging');

const i18n = require('./helpers/translator');

// procesa argumentos y ejecuta comando
yargs
    .middleware(logging)
    .scriptName("edu-git-remote")
    .usage('$0 <command> [args]')
    .count('verbose')
    .alias('v', 'verbose')
    .alias('s', "silent")
    .command({
        command: 'add', 
        describe: i18n.__('Agrega los repositorios remotos a partir de un fichero csv'),
        builder: parsed => {
            parsed.option('f', {
                alias: 'file',
                describe: i18n.__('Fichero de importación')
            })
            parsed.option('default-branch', {
                describe: i18n.__('Añade como rama por defecto la indicada en el fichero'),
                type: 'bool',
                default: true,
            })
        },
        handler: add,
    })
    .command({
        command: 'remove', 
        describe: i18n.__('Elimina los repositorios remotos'),
        builder: parsed => {
            parsed.option('p',{
                alias: 'prefix',
            })
            parsed.option('y',{
                alias: 'yes',
            })
        },
        handler: remove,
    })
    .strict()
    .demandCommand(1, i18n.__('Debes especificar un comando'))
    .help()
    .argv
