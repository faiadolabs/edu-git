const simpleGit = require('simple-git');
const path = require('path');
const chalk = require('chalk');
const { getLogger } = require('../helpers/logger');

const gitStates = {
    stateFETCHED      : chalk.green  `[FETCHED]`,
    stateFETCHED_BG   : chalk.bgGreen`[FETCHED]`,
    stateFAIL         : chalk.red    `[FAILED]`,
    stateREF          : chalk.yellow `[REF]\t`,
    stateADDED        : chalk.green  `[ADDED]\t`,
    stateREMOVED      : chalk.yellow `[REMOVED]`,
    stateARCHIVED     : chalk.cyan   `[ARCHIVED]`,
    stateARCHIVED_BG  : chalk.bgCyan `[ARCHIVED]`,
    stateOTHER        : chalk.yellow `[?]\t`,
}

function _getStage(cmd){
    if(cmd.includes('remote add'))             return gitStates.stateADDED;
    else if(cmd.includes('remote remove'))     return gitStates.stateREMOVED;
    else if(cmd.includes('remote update'))     return gitStates.stateFETCHED;
    else if(cmd.includes('remote fetch'))      return gitStates.stateFETCHED;
    else                                       return gitStates.stateOTHER;
}

async function git(){
    const repo = simpleGit({
        baseDir: process.cwd(),
        errors: (error, result) => {
                // optionally pass through any errors reported before this plugin runs
                if (error){
                    // Evalúo tipo de error
                    const typeError = error.message.includes('refs/heads/') ?
                        gitStates.stateREF : 
                        gitStates.stateFAIL;
                    // Escribo mensaje si no hay comando
                    const info = repo.cmd ?
                        repo.cmd :
                        error.message
                    //getLogger().error(`${typeError} ${info}`, { exitCode : result.exitCode } );
                    getLogger().debug(error);
                    return error;
                }
          
                // customise the `errorCode` values to treat as success
        //         if (repo.cmd && result.exitCode === 0) {
        //             getLogger().info(`${_getStage(repo.cmd)} ${repo.cmd}`, { exitCode : result.exitCode } );
        //             getLogger().debug(result);
        //             return;
        //         }
        }
    });

    return repo.checkIsRepo()
        .then( isRepo => {
            //return isRepo ? repo : process.exit(1));
            if(!isRepo){
                const msg = i18n.__('no es un repositorio git');
                getLogger().error(msg)
                throw Error(msg);
            }
            return repo;
        })
        .catch( () => process.exit(1))
}

async function sumarize(error, cmd, sumary){
    getLogger().debug(sumary);
    let mensaje = "";

    if(!error){
        stage = _getStage(cmd);
    } else {
        stage = gitStates.stateFAIL;
        // mensaje += error.message;
    }

    getLogger().info(`${stage}\`${cmd}\` ${mensaje}`);
}

async function git_path(){
    // const repo = await git();
    const repo = simpleGit(process.cwd());
    const topLevel = await repo.revparse(['--show-toplevel'])
    const repo_name = path.basename(topLevel);
    return { topLevel, repo_name };
}

async function git_bare_init(path){
    const git = simpleGit(path);
    try {
        await git.init(bare=true);
        return { newRepo: git}
    } catch (e) {
        /* handle all errors here */
    }
}

async function get_default_release_branch(remote_alias) {
    //FIXME: Control de errores
    const repo = simpleGit(process.cwd());
    const config = await repo.getConfig(`remote.${remote_alias}.fetch`);
    
    // Se divide la cadena primero por 'refs/heads/' y luego por ':', obteniendo así la subcadena entre estos dos delimitadores.
    const result = config.value.split('refs/heads/')[1].split(':')[0];
    return result;
}

module.exports = {
    git,
    git_path,
    gitStates,
    git_bare_init,
    get_default_release_branch,
    sumarize,
}