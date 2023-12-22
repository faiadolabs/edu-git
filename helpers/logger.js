const { createLogger, format, transports } = require('winston');
const process = require('process');
const path = require('path');
const { Console } = require('console');

class PrivateSingleton {
    constructor() {
        this.message = 'I am singleton instance';
    }
}

class Singleton {
    constructor() {
        throw new Error('Use Singleton.getInstance()');
    }
    static getInstance() {
        if (!Singleton.instance) {
            Singleton.instance = new PrivateSingleton();
        }
        return Singleton.instance;
    }

    static getLogger(){
        if(!Singleton.getInstance().logger){
            // Crea una instancia básica para logging
            return Singleton.getInstance().logger = createLogger({
                exitOnError: true,
                transports: [
                    new transports.Console(),
              ]});
            
        }
        return Singleton.getInstance().logger;
    }

    static LoggerFactory(argv, logPath){

        const { silent=false, v:verbosity } = argv;

        const instance = Singleton.getInstance();

        if(!argv || !logPath){
            return instance.logger = createLogger();
        }

        // Recuperación del level de verbosidad
        let level; 
        switch(verbosity){
            case 3: level = 'debug'; break;
            case 2: level = 'verbose'; break;
            case 1: level = 'info'; break;      // Registra salida por consola
            default: level = 'info';
        }
        
        // Especificación de formatos
        const myFormatFile = format.printf(({ level, message, label, timestamp, exitCode }) => {
            return `${timestamp} [${label}] ${level}: ${message} - exitCode(${exitCode})`;
        });
        
        const myFormatConsole = format.printf(({ message }) => {
            return `${message}`;
        });
        
        
        // Establecimiento de los canales que quiero de log
        const canales = [
            // - Write all logs with level `info` and below to `combined.log`
            new transports.File({ 
                filename: `${logPath}/combined.log`,
                level: 'info'
            }),
            new transports.File({ 
                filename: `${logPath}/errors.log`,
                level: 'error'
            }),
            // Si el nivel es info, no añado el siguiente canal
            ...(level === 'info' ? [] : [new transports.File({ 
                filename: `${logPath}/debug.log`,
                level: 'debug',
                format: format.json()
            })]),
            new transports.Console( 
                { format: myFormatConsole } 
            ),
        ];

        // Creación del logger
        try {
            const newLogger = createLogger({
                level,
                silent,
                exitOnError:true,
                format: format.combine(
                    format.label({ label: path.basename(process.argv[1]) }),
                    format.timestamp(),
                    myFormatFile
                ),
                transports : canales,
            });

            // FIXME: No funciona Manejo de errores
            newLogger.on('error', (error) => {
                console.error('Error al escribir en el log:', error.message);
            });

            instance.logger = newLogger;
            
        } catch (error) {
            console.log(error);
        }

        return instance.logger;
    }
}

module.exports = {
    getLogger: Singleton.getLogger,
    createLogger: Singleton.LoggerFactory,
};