const { git, get_default_release_branch, gitStates } = require('../helpers/git');
const { getLogger } = require('../helpers/logger');
const i18n = require('../helpers/translator');

async function fetch(argv) {
    const { prefix, branch } = argv
    const repo = await git();
    // const logger = await require('../helpers/logger');
    const remotes = await repo.getRemotes();
    
    for ( const { name:alias } of remotes){
        // Si no empieza por el prefijo indicado, nos saltamos el fetch
        if(prefix && !alias.startsWith(prefix)) continue;
        
        try {
            const branch_for_fetch = branch ? 
                branch :
                await get_default_release_branch(alias);

            repo.cmd = `git fetch ${alias} ${branch_for_fetch}`
            await repo.fetch(alias, branch_for_fetch)
            .then( (sumary, a, b, c) => { 
                sumarize(null, repo.cmd, sumary)} 
            ).catch((error) => { 
                sumarize(error, repo.cmd)}
            );
            
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
        if(sumary.updated && sumary.updated.length === 0) {
            stage = gitStates.stateFETCHED;
            cambios = `(${i18n.__('fetch.cambios.zero')})`;
        } else if(sumary.updated && sumary.updated.length > 0){
            stage = gitStates.stateFETCHED_BG;
            cambios = `(${i18n.__n('fetch.cambios', sumary.updated.length)})`;
            commit = `(${sumary.updated[0].to})`;
        }
    } else stage = gitStates.stateFAIL;

    getLogger().info(`${stage}\`${cmd}\` ${commit} ${cambios}`);
}


module.exports = {
    fetch,
}