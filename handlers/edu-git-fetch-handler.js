const { git, gitStates } = require('../helpers/git');

async function fetch(argv) {
    const { prefix, branch } = argv
    const repo = await git();
    // const logger = await require('../helpers/logger');
    const remotes = await repo.getRemotes();
    
    for ( const { name:alias } of remotes){
        // Si no empieza por el prefijo indicado, nos saltamos el fetch
        if(prefix && !alias.startsWith(prefix)) continue;
        
        try {
            if(branch){
                repo.cmd = `git fetch ${alias} ${branch}`;
                await repo.fetch(alias, branch);
            }
            else{
                repo.cmd = `git remote update ${alias}`;
                await repo.remote(["update", alias]);
            }
        } catch (error) {
            continue;
        }
    }
}

module.exports = {
    fetch,
}