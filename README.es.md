# `edu-git`

- [Sobre este proyecto](#sobre-este-proyecto)
- [Instalación](#instalación)
- [Uso](#uso)
  - [Añadir de forma automatizada los repositorios remotos](#añadir-de-forma-automatizada-los-repositorios-remotos)
  - [Sincronización de los repositorios](#sincronización-de-los-repositorios)
- [Licencia](#licencia)
- [Contacto](#contacto)

## Sobre este proyecto

`edu-git` es un *toolkit* o conjunto de scripts que facilitan la sincronización de repositorios bajo un supuesto ambiente académico, en el que hay una relación instructor/profesor con alumnos. Esta utilidad se basa en tener un repositorio base, donde se planteará la actividad, y un conjunto de FORKs donde se espera el trabajo desenvuelto por el alumnado.

El toolkit `edu-git` se plantea en un conjunto de script que faciliten y automaticen las tareas más frecuentes y repetitivas, como añadir en el repositorio del instructor/profesor el resto de repositorios remotos correspondientes a todos los FORKs de los alumnos. A través de un fichero CVS, se dispondrán de los datos suficientes para realizar esta tarea así como una sucesión de scripts para realizar las operaciones más frecuentes (sincronización o fetch de ramas, checkouts con acciones asociadas, archivo de soluciones para auditoría, etc.)

Quizá se pueda utilizar para otros propósitos, pero se insiste en el que el objeto es fundamentalmente para un ambiente académico.

- [Sobre este proyecto](#sobre-este-proyecto)
- [Instalación](#instalación)
- [Uso](#uso)
  - [Añadir de forma automatizada los repositorios remotos](#añadir-de-forma-automatizada-los-repositorios-remotos)
  - [Sincronización de los repositorios](#sincronización-de-los-repositorios)
- [Licencia](#licencia)
- [Contacto](#contacto)

## Instalación

Ya sea mediante clonación con git o usando npm (la forma recomendada):

```bash
npm install -g edu-git
```

Se instala de forma global porque el propósito de los scripts `edu-git` es utilizarlo repositorios repartidos por diferentes paths del sistema.

## Uso

### Añadir de forma automatizada los repositorios remotos

El primer paso es añadir un conjunto más o menos grande de cadenas de conexión a repositorios remotos (generalmente serán de alumnos). Para ello, debe existir un fichero CSV con los datos necesarios para añadir estos repositorios remotos.

El fichero estárá ubicado por defecto en la ruta interna del propio reto exactamente con este nombre `.git/people.csv`. Un ejemplo de este fichero podría ser:

```csv
default_release_branch ,acount     ,prefix      ,suffix     ,platform       ,surname  ,name   ,
main                   ,faiadolabs ,COURSE2324- ,-2021-dist ,git@github.com ,Martinez ,Kike   ,
main                   ,faiadolabs ,COURSE2324- ,-2021-dist ,git@github.com ,Perez    ,Pepe   ,
main                   ,faiadolabs ,COURSE2324- ,-2021-dist ,git@github.com ,Álvarez  ,Manolo ,
master                 ,faiadolabs ,COURSE2324- ,-2021-dist ,git@github.com ,Inválido ,Paco   ,
```

En este fichero se pueden ver los campos necesarios evitentes para realizar una sincronización de un repo con sus remotos, y además, un campo denominado como `default_release_branch`, que será la rama por defecto en la que los alumnos dejen planteada su propia solución, su propia *release branch* o *rama de entrega*.

Un consejo sobre la generación de este fichero es que sea creado por los propios alumnos en una hoja de cálculo colaborativa en una Hoja de Cálculo de Google para que esta luego sea exportada en formato `.csv`. La *rama de entrega* o *release branch* por otra parte, conviene que sea con un formato normalizado. Por ejemplo `rb/nameSurname/develop`.

El script utilizado en este caso será `edu-git-remote` y se podrá consultar su uso con la opción `--help`, empleando esta para su uso general o para su subcomando específico en particular:

```bash
# edu-git remote --help
edu-git-remote <command> [args]

Comandos:
  edu-git-remote add     Agrega los repositorios remotos a partir de un fichero
                         csv
  edu-git-remote remove  Elimina los repositorios remotos

Opciones:
  --version  Muestra número de versión                                [booleano]
  --help     Muestra ayuda                                            [booleano]
```

```bash
# edu-git remote add --help
edu-git-remote add

Agrega los repositorios remotos a partir de un fichero csv

Opciones:
      --version         Muestra número de versión                     [booleano]
      --help            Muestra ayuda                                 [booleano]
  -f, --file            Fichero de importación
      --default-branch  Añade como rama por defecto la indicada en el fichero
```

A continuación y partiendo de un repositorio donde se plantee un ejercicio académico, y se deseen añador los FORKs de los alumnos se realizaría la siguiente operación:

```bash
# Situándose por ejemplo en ~/git/programming-exercise-01/
edu-git-remote add
```

El resultado que arrojaría el script es:

```txt
[ADDED] git remote add COURSE2324-MartinezKike ssh://git@github.com/faiadolabs/programming-exercise-01
[ADDED] git remote add COURSE2324-PerezPepe ssh://git@github.com/faiadolabs/programming-exercise-01
[ADDED] git remote add COURSE2324-ÁlvarezManolo ssh://git@github.com/faiadolabs/programming-exercise-01
[ADDED] git remote add COURSE2324-InválidoPaco ssh://git@github.com/faiadolabs/programming-exercise-01
```

### Sincronización de los repositorios

Una vez añadidas las cadenas de conexión a los repositorios remotos, se puede proceder a la sincronización con el siguiente script:

```bash
# edu-git-fetch --help
edu-git-fetch <command> [args]

Opciones:
      --version  Muestra número de versión                            [booleano]
  -p, --prefix
  -b, --branch
      --help     Muestra ayuda                                        [booleano]
```

Para realizar una sincronización básica:

```bash
# Situándose por ejemplo en ~/git/programming-exercise-01/
edu-git-fetch
```

```bash
[REF] git remote update COURSE2324-InválidoPaco
[FETCHED] git remote update COURSE2324-MartinezKike
[FETCHED] git remote update COURSE2324-PerezPepe
[FETCHED] git remote update COURSE2324-ÁlvarezManolo
[FETCHED] git remote update origin
```

Nótese que en la salida se puede apreciar la correcta sincronización o no de cada uno de los remotos. Puede haberse sincronizado (`FETCHED`), haber fallado por credenciales o mala cadena de conexión (`FAIL`) o puede haberse producido la conexión pero no ser posible la sincronización de la rama por un problema de nombrado de esta (`REF`)

## Licencia

MIT especificada en [LICENCE.txt](./LICENSE.txt)

## Contacto

Project Link: [https://github.com/faiadolabs/edu-git](https://github.com/faiadolabs/edu-git)
