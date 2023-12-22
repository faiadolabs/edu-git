const simpleGit = require('simple-git');
const path = require('path');
const chalk = require('chalk');
const { getLogger } = require('../helpers/logger');

const gitStates = {
    stateFETCHED      : chalk.green`[FETCHED]`,
    stateFAIL         : chalk.red`[FAIL]`,
    stateREF          : chalk.yellow`[REF]`,
    stateADDED        : chalk.green`[ADDED]`,
    stateREMOVED      : chalk.yellow`[REMOVED]`,
    stateOTHER        : chalk.yellow`[?]`,
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
                    getLogger().error(`${typeError} ${repo.cmd}`, { exitCode : result.exitCode } );
                    getLogger().debug(error);
                    return error;
                }
          
                // customise the `errorCode` values to treat as success
                if (repo.cmd && result.exitCode === 0) {
                    getLogger().info(`${_getStage(repo.cmd)} ${repo.cmd}`, { exitCode : result.exitCode } );
                    getLogger().debug(result);
                    return;
                }
        }
    });

    return repo.checkIsRepo()
        .then( isRepo => {
            //return isRepo ? repo : process.exit(1));
            if(!isRepo){
                console.log('not a git repository')
                throw Error("not a git repository");
            }
            return repo;
        })
        .catch( () => process.exit(1))
}

async function git_path(){
    // const repo = await git();
    const repo = simpleGit(process.cwd());
    const topLevel = await repo.revparse(['--show-toplevel'])
    const repo_name = path.basename(topLevel);
    return { topLevel, repo_name };
}

module.exports = {
    git,
    git_path,
    gitStates,
}