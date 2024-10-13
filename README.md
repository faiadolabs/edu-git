# `edu-git`

- [About this project](#about-this-project)
- [Installation](#installation)
- [Usage](#usage)
  - [Automatically add remote repositories](#automatically-add-remote-repositories)
  - [Repository synchronization](#repository-synchronization)
- [Licence](#licence)
- [Contact](#contact)

## About this project

`edu-git` is a toolkit or set of scripts that facilitates the synchronization of repositories in an academic environment where there is an instructor/teacher-student relationship. This tool is based on having a base repository, where the activity will be defined, and a set of FORKs where the work done by the students is expected to be submitted.

The `edu-git` toolkit consists of a set of scripts that simplify and automate the most frequent and repetitive tasks, such as adding all the students' FORK repositories as remote repositories in the instructor/teacher's repository. Through a CSV file, the necessary data will be provided to carry out this task, as well as a series of scripts to perform the most common operations (branch synchronization or fetch, checkouts with associated actions, solution archiving for auditing, etc.).

It may be useful for other purposes, but it is primarily designed for an academic environment.

## Installation

Either by cloning with git or using npm (the recommended method):

```bash
npm install -g edu-git
```

It is installed globally because the purpose of the edu-git scripts is to be used with repositories spread across different paths in the system.

## Usage

### Automatically add remote repositories

The first step is to add a more or less large set of remote repository connection strings (usually from students). For this, there must be a CSV file with the necessary data to add these remote repositories.

The file will be located by default in the internal path of the repository with the exact name `.git/people.csv`. An example of this file could be:

```csv
default_release_branch ,acount     ,prefix      ,suffix, platform       ,surname  ,name   ,
main                   ,student01 ,COURSE1920- ,-dist  , git@github.com ,Martinez ,Kike   ,
main                   ,student02 ,COURSE1920- ,-dist  , git@github.com ,Perez    ,Pepe   ,
main                   ,student03 ,COURSE1920- ,-dist  , git@github.com ,Álvarez  ,Manolo ,
master                 ,student04 ,COURSE1920- ,-dist  , git@github.com ,Inválido ,Paco   ,
```

In this file, you can see the necessary fields to synchronize a repository with its remotes, as well as a field named `default_release_branch`, which will be the default branch where students submit their own solution, their own release branch or delivery branch.

A tip for generating this file is to have it created by the students themselves in a collaborative spreadsheet, such as a Google Sheet, which can then be exported in `.csv` format. The delivery branch or release branch, on the other hand, should follow a standardized format. For example, `rb/nameSurname/develop`.

The script used in this case will be `edu-git-remote`, and its usage can be checked with the `--help` option, either for general use or for a specific subcommand in particular:

```bash
# edu-git remote --help
edu-git-remote <command> [args]

Comandos:
  edu-git-remote add     Add remote repositories from a file
  edu-git-remote remove  Delete remote repositories

Opciones:
  --version  Show versión installed                               [booleano]
  --help     Show help                                            [booleano]
```

Next, starting from a repository where an academic exercise is defined and you want to add the students' FORKs, the following operation would be performed:

```bash
# For example, being in ~/git/programming-exercise-01/
edu-git-remote add
```

The result produced by the script is:

```txt
[ADDED] git remote add COURSE1920-MartinezKike ssh://git@github.com/student01/programming-exercise-01
[ADDED] git remote add COURSE1920-PerezPepe ssh://git@github.com/student02/programming-exercise-01
[ADDED] git remote add COURSE1920-ÁlvarezManolo ssh://git@github.com/student03/programming-exercise-01
[ADDED] git remote add COURSE1920-InválidoPaco ssh://git@github.com/student04/programming-exercise-01
```

### Repository synchronization

Once the connection strings have been added to the remote repositories, synchronization can be carried out with the following script:

```bash
# edu-git-fetch --help
edu-git-fetch <command> [args]

Opciones:
      --version  Muestra número de versión                            [booleano]
  -p, --prefix
  -b, --branch
      --help     Muestra ayuda                                        [booleano]
```

To perform basic synchronization:

```bash
# For example, being in ~/git/programming-exercise-01/
edu-git-fetch
```

```bash
[REF] git remote update COURSE1920-InválidoPaco
[FETCHED] git remote update COURSE1920-MartinezKike
[FETCHED] git remote update COURSE1920-PerezPepe
[FETCHED] git remote update COURSE1920-ÁlvarezManolo
[FETCHED] git remote update origin
```

Note that the output shows whether each remote has been correctly synchronized or not. It may have synchronized (`FETCHED`), failed due to credentials or an incorrect connection string (`FAIL`), or the connection may have been made but synchronization of the branch was not possible due to a naming issue (`REF`).

## Licence

MIT especificada en [LICENCE.txt](LICENSE.txt)

## Contact

Project Link: [https://github.com/faiadolabs/edu-git](https://github.com/faiadolabs/edu-git)
