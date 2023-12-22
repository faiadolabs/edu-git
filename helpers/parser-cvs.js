const { getLogger } = require('./logger');

const cvsParser = (file) => {
    // Buscar el fichero o recuperarlo de parámetro
    
    // El fichero está bien formado?
    
    // Procesarlo...
    const fs = require('fs');
    const Papa = require('papaparse');
    
    try {
        const contentFile = fs.readFileSync(file, "utf8");
        
        const result = Papa.parse(contentFile, {
            header: true,
            delimiter: ',',
            skipEmptyLines: 'greedy', //meaning skip delimiters, quotes, and whitespace.
            transformHeader: (value) => value.trim(),
            transform: (value) => value.trim(),
        });

        return result.data;

    } catch (error) {
        if(error.code === "ENOENT"){
            console.log(`Fichero inaccesible: ${file}\nUtiliza el parámetro --file para especificar uno distinto`)
        }
        getLogger().error(error.message)
        process.exit(1);
    }
    
    

}


// Interfaz
module.exports = cvsParser
