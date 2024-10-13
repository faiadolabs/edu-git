const fs = require('fs');
const Confirm = require('prompt-confirm');
const { git, git_path, git_bare_init, gitStates } = require('../helpers/git');
const { fetch } = require('./edu-git-fetch-handler');
const { getLogger } = require('../helpers/logger');
const i18n = require('../helpers/translator');
const { exit } = require('process');

const bare_repos_path = "../archive2";
const bare_repo_name = "archive";

async function archive(argv) {
    const { remote:remote_prefix, branch:branch_prefix, yes, fetch:arg_fetch } = argv
    const repo = await git();
    // const logger = await require('../helpers/logger');
    const remotes = await repo.getRemotes();
    const { topLevel, repo_name } = await git_path();
    
    if(remotes.map(item => item.name).includes(bare_repo_name)){
        getLogger().debug(`${i18n.__('El remoto')} ${bare_repo_name} ${i18n.__('ya existe')}`);
        // Comprobar si existe y es un repo bare
    } else {
        const path_bare_repo = `${topLevel}/${bare_repos_path}/${repo_name}`;
        // Si la opción --yes no está explícitamente como argunmento => pregunta
        if(!yes){
            const answer = await new Confirm(`${i18n.__('El repositorio de archivo no existe. ¿Lo creo?')} ${path_bare_repo}`).run();
            if(!answer) return;
        }
        await createDirectory(path_bare_repo);
        git_bare_init(path_bare_repo);

        // Creo la ref al remoto (bare_repo_name)
        try {
            repo.addRemote(bare_repo_name, `${bare_repos_path}/${repo_name}`);
        } catch (error) {
            getLogger().error(`${i18n.__('No se pudo añadir el remoto')}: ${bare_repos_path}/${repo_name}`);
            exit(1);
        }
    }

    // Reutilizo el fetch con los mismos argumentos para realizar si es posible una última sincro antes de archivar
    if(arg_fetch) {
        getLogger().info(`\n\n${i18n.__('No se pudo añadir el remoto')}\n`);
        await fetch(argv);
    }

    // Recorro todas las ramas que coincidan con el criterio
    getLogger().info(`\n\n${i18n.__('Procediendo con el archivo...')}\n`);
    const branches = await repo.branch(['-r']);
    for ( const branch of branches.all){
        // Si se trata de una rama remota del propio archivo, no se proseguirá
        if(branch.startsWith(bare_repo_name)) continue;
        // Si el repo no empieza por el prefijo indicado, no se hará el archivo
        if(remote_prefix && !branch.startsWith(remote_prefix)) continue;
        // Si la rama no empieza por el prefijo indicadno, no se hará el archivo
        if(branch_prefix && !stripRemotePrefix(branch).startsWith(branch_prefix)) continue;
        
        try {
            repo.cmd = `git push ${bare_repo_name} ${branch}:refs/heads/${branch}`;
            await repo.push(bare_repo_name, `${branch}:refs/heads/${branch}`).then( 
                (sumary) => { sumarize(null, repo.cmd, sumary)} )
                .catch( 
                    (error) => sumarize(error, repo.cmd));
        } catch (error) {
            continue;
        }
    }
}

async function sumarize(error, cmd, sumary){
    getLogger().debug(sumary);

    let stage = gitStates.stateOTHER;
    let cambios = "", commit = "";

    if(!error){
        // Procesar el sumario
        if(sumary.update) {
            stage = gitStates.stateARCHIVED_BG;
            cambios = `${i18n.__('archivo.cambios')}`;
            commit = `(${sumary.update.hash.to})`;
        } else if(sumary.pushed && sumary.pushed.length > 0){
            if(sumary.pushed[0].new) cambios = `(${i18n.__('creada rama en archivo')})`;
            else if(!sumary.pushed[0].new && sumary.pushed[0].alreadyUpdated) cambios = `(${i18n.__('archivo.cambios.zero')})`;
            stage = gitStates.stateARCHIVED;
        }
    } else stage = gitStates.stateFAIL;

    getLogger().info(`${stage}\`${cmd}\` ${commit} ${cambios}`);
}

function createDirectory(dirPath) {
    return new Promise((resolve, reject) => {
        fs.mkdir(dirPath, { recursive: true }, (err) => {
            if (err) {
                reject(`Error al crear el directorio: ${err.message}`);
            } else {
                resolve(`Directorio ${dirPath} creado.`);
            }
        });
    });
}

function stripRemotePrefix(cadena) {
    const indiceBarra = cadena.indexOf("/");
    return cadena.substring(indiceBarra + 1);
}

module.exports = {
    archive,
}