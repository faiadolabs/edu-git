const cvsParser = require('../helpers/parser-cvs');
const chalk = require('chalk');
const Confirm = require('prompt-confirm');
const { git, git_path, gitStates } = require('../helpers/git');

async function add( argv ){
    const { file, defaultBranch } = argv;
    const repo = await git();
    const { topLevel, repo_name } = await git_path();
    
    // Leer fichero facilitado
    const data = cvsParser(file ? file : `${topLevel}/.git/people.csv`);

    for (const { name, surname, platform, acount, prefix, default_release_branch } of data){
        const uri = `ssh://${platform}/${acount}/${repo_name}`;
        const alias = `${prefix}${surname.split(" ").join("")}${name.split(" ").join("")}`;

        // Introduce la rama indicada en el fichero como referencia por defecto
        const options = default_release_branch && default_release_branch.trim() != '' ? ['-t', default_release_branch.trim()] : [];

        try {
            repo.cmd = `git remote add ${alias} ${uri}`;
            await repo.addRemote(alias, uri, options);
        } catch ( {message} ) {
            continue;
        }
    }
}

async function remove( argv ){
    const { prefix, yes } = argv
    const repo = await git();
    const remotes = await repo.getRemotes();

    for ( const { name:alias } of remotes){
        // Si no empieza por el prefijo indicado, nos saltamos la eliminación
        if(prefix && !alias.startsWith(prefix)) continue;

        // Si la opción --yes no está explícitamente como argunmento => pregunta
        if(!yes){
            const answer = await new Confirm(`eliminar ${alias}?`).run();
            if(!answer) continue;
        }

        try {
            repo.cmd = `git remote remove ${alias}`;
            await repo.removeRemote(alias);
        } catch ( {message} ) {
            continue;
        }
    }
}

module.exports = {
    add,
    remove
}
