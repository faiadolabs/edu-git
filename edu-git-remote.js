#!/usr/bin/env node
const { add, remove } = require('./handlers/edu-git-remote-handler');
const yargs = require('yargs');

const { logging } = require('./middleware/logging');

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
        describe: 'Agrega los repositorios remotos a partir de un fichero csv',
        builder: parsed => {
            parsed.option('f', {
                alias: 'file',
                describe: 'Fichero de importación'
            })
            parsed.option('default-branch', {
                describe: 'Añade como rama por defecto la indicada en el fichero',
                default: true,
            })
        },
        handler: add,
    })
    .command({
        command: 'remove', 
        describe: 'Elimina los repositorios remotos',
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
    .demandCommand(1, 'Debes especificar un comando')
    .help()
    .argv
