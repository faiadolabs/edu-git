#!/usr/bin/env python
"""
\033[95mFORMATO:\033[0m 
    edu-git-sync <path> command options

\033[95mDESCRIPCION\033[0m

    El siguiente script permite tratar en lote un conjunto de repositorios GIT situados en un determinado PATH. La 
    localización de los repositorios para un PATH dado se hará de forma recursiva.
    Los comandos implementados hasta el momento son:

\033[95mCOMANDOS:\033[0m

    \033[1m repos \033[0m: 
        Sintaxis: edu-git-sync <path> repos
        Descripción: Dado un <path> localiza recursivamente todos los repositorios y los muestra en pantaña 
        distinguiendo los BARE de los que tienen working directories.
        Parámetros: Sin paránetros.

    \033[1m dirty \033[0m: 
        Sintaxis: edu-git-sync <path> dirty
        Descripción: Dado un <path> localiza recursivamente todos los repositorios no BARE que tienen espacios de
        de trabajo sucios (commits pendientes). 
        Parámetros: Sin paránetros.

    \033[1m connect \033[0m: 
        Sintaxis: edu-git-sync <path> connect <parámetros>
        Descripción: Dado un <path> localiza recursivamente todos los repositorios y los conecta a un  repositorio 
        remoto, con una url especificada por ssh.
        Parámetros:
            --user <username> 
            --host <IP|name>
            --name <remote_name>

    \033[1m fetch \033[0m: 
        Sintaxis: edu-git-sync <path> fetch <parámetros>
        Descripción: Dado un <path> localiza recursivamente todos los repositorios y realiza un fetch de todas las
        referencias remotas o sólo aquella especificada por parámetro. También es posible que genere un script para
        clonado rápido de todos los repos que no existen en remoto pero que sí están conectados con param '--file'
        Parámetros: 
            [--name <remote_name>]
            [--file <path>] - Especifica un path donde creará un script para el clonado de repos en remoto

    \033[1m clone \033[0m: 
        Sintaxis: edu-git-sync <path> clone <parámetros>
        Descripción: Dado un <path> localiza recursivamente todos los repositorios y realiza desde un máquina remota
        un clonado de todos estos repositorios
        Parámetros: 
            --remote <remote_name> - Se especifica el nombre de la máquina remota (p.e. `pro.local`)
            --user <user> - Se especifica el nombre de usuario que establecerá la conexión ssh
            --name <name_remote> - Se especifica el nombre de la referencia remota del repositorio origen (p.e. `macario`)
"""

import sys
from os import walk, listdir, getlogin, uname
from os.path import isfile, isdir, join, abspath
print("Python" + sys.version)

try:
    from git import Repo, InvalidGitRepositoryError
    from git.repo.fun import is_git_dir
    from git.exc import GitCommandError
except ModuleNotFoundError:
    print("\n\nEl módulo 'gitpython' no está instalado. Puedes instalarlo ejecutando:")
    print("pip install gitpython")
    print("Más info: GitPython (https://gitpython.readthedocs.io/en/stable/intro.html)\n")
    sys.exit(1)

#################################################
# UTILS
#################################################
def __pregunta_si_no__(pregunta=""):
    """Dada una pregunta, retorna True o False en función de si la respuesta es afirmativa o negativa"""
    opciones = ["yes", "si", "no", "s", "y", "n"]
    respuesta = None
    while (respuesta not in opciones):
        respuesta = input(bcolors.bold(pregunta + " (yes, no): "))
    return respuesta == "yes" or respuesta == "y" or respuesta == "s"

class bcolors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    
    @classmethod
    def info(cls, msg): return bcolors.OKBLUE + msg + bcolors.ENDC
    @classmethod
    def ok(cls, msg): return bcolors.OKGREEN + msg + bcolors.ENDC
    @classmethod
    def error(cls, msg): return bcolors.FAIL + msg + bcolors.ENDC
    @classmethod
    def warning(cls, msg): return bcolors.WARNING + msg + bcolors.ENDC
    @classmethod
    def header(cls, msg): return bcolors.HEADER + msg + bcolors.ENDC
    @classmethod
    def bold(cls, msg): return bcolors.BOLD + msg + bcolors.ENDC


def __search_repos__(repos, path):
    try:
        for f in listdir(path):
            if isdir(join(path, f)) and is_git_dir(join(path, f, ".git")):
                # Fin recursión. Repo con Workspace
                # print(join(f,"Sí"))
                unRepo = Repo(join(path, f))
                repos.append(unRepo)
            elif isdir(join(path, f)) and is_git_dir(join(path, f)):
                # Fin recursión. Bare Repo
                # print(join(f,"Sí - BARE"))
                unRepo = Repo(join(path, f))
                # print(unRepo, "Es bare? ", unRepo.bare)
                repos.append(unRepo)
            elif isdir(join(path, f)) and not is_git_dir(join(path, f, ".git")): 
                __search_repos__(repos, join(path, f))
            else:
                # Fin recursión
                pass
    except  FileNotFoundError as e:
        print("\n", bcolors.error("[ERROR]"), e.strerror)
        exit(1)


def tipo(repo):
    return bcolors.warning("[BARE]") if repo.bare else ""

def __print_repos__(repos):
    print(bcolors.HEADER + "\nRepositorios:\n" + bcolors.ENDC)
    for repo in repos:
        print("{} {} {}".format(bcolors.info("[REPO]"), tipo(repo), repo))
    print(bcolors.BOLD + "\nTotal de Respos: ", len(repos), "\n\n" + bcolors.ENDC)
        

def __create_remote__(repo, name, path):
    for un_remote in repo.remotes:
        if un_remote.name == name:
            print(bcolors.warning("[WARN]: "), "Ya existe el remoto {} para {}".format(name, repo))
            return None

    # Procediendo con el nuevo remoto y fetch
    tipo = bcolors.warning("[BARE]") if repo.bare else ""
    print(bcolors.ok("[OK]: "), "Creado el remoto {} {} para {}".format(tipo, name, repo))
    return repo.create_remote(name, path)


def __repo_info_flag__(flag):
    flag_types = {
        128:bcolors.error("ERROR"),
        64: bcolors.bold("FAST_FORWARD"),
        32: bcolors.warning("FORCED_UPDATE"),
        4:  bcolors.ok("HEAD_UPTODATE"),
        2:  bcolors.bold("NEW_HEAD"),
        1:  bcolors.bold("NEW_TAG"),
        16: bcolors.error("REJECTED"),
        8:  bcolors.bold("TAG_UPDATE")
    }
    return flag_types.get(flag, bcolors.warning("UNKNOW_FLAG"))


def __obtain_local_name_host__(domain=False):
    local_host = uname()[1]
    if ".local" not in local_host: local_host += ".local"
    name_host = local_host.split(".")[0].lower()
    return local_host if domain else name_host


def __fetch_repos__(*repos, name_remote=None, path_file_remote_script=None):
    print("\n", bcolors.header("Fetch Repositorios:"), "\n")
    num_fetched = 0
    for repo in repos:
        print("\n" + bcolors.bold("[FECHING...]"), tipo(repo), repo.git_dir)
        try:
            remotes = repo.remotes if name_remote is None else [repo.remote(name=name_remote)]
        except ValueError:
            print("\t", bcolors.warning("[NO EXISTE EL REMOTO]"), "No existe en el repo la referencia remota {}".format(name_remote))
            remotes = []

        for un_remote in remotes:
            try:
                # TODO: Necesario establecer un timeout: https://stackoverflow.com/questions/492519/timeout-on-a-function-call
                fetch_info = un_remote.fetch()
                flags = 0 if len(fetch_info) == 0 else fetch_info[0].flags
                print("\t", bcolors.ok("[Ok fetched]"), un_remote, __repo_info_flag__(flags))
                # TODO Bug: se incremente por cada referencia a remoto y no por cada repo.
                num_fetched += 1
            except GitCommandError as e:
                if e.status == 128 : # El repo NO existe en remoto
                    print("\t", bcolors.error("[ERROR fetching]"), un_remote, "does not appear to be a git repository")
                    # Sugerir cómo clonarlo
                    local_host = __obtain_local_name_host__()
                    name_host = str(getlogin())
                    git_dir = repo.git_dir if repo.bare else repo.working_tree_dir
                    # TODO Bug realizarlo en base a la referencia remota y no al repo actual (p.e. cuando hay varias referencias remotas no tiene sentido...)
                    clone_instruction = "git clone -o {} ssh://enrique@{}:{} {}".format(local_host, local_host, git_dir, git_dir)
                    if path_file_remote_script is not None : 
                        print(join(path_file_remote_script,"edu-git-sync-script.sh"))
                        with open(join(path_file_remote_script,"edu-git-sync-script.sh"), 'a') as f:
                            f.write(clone_instruction + "\n")
                        print("\t", bcolors.warning("[ADDED TO SCRIPT]"), bcolors.info(clone_instruction))
                    else:
                        print("\t", bcolors.warning("[RUN IN REMOTE]"), bcolors.info(clone_instruction))
            except Exception as e:
                print("\t", bcolors.error("[ERROR fetching]"), un_remote, e)
    print("\n", bcolors.bold("Total: {}/{}".format(num_fetched , len(repos))), "\n\n")

    
def __get_dirty_repos__(*repos):
    print("\n", bcolors.header("Repositorios en estado DIRTY:"), "\n")
    num_dirty=0
    for repo in repos:
        if not repo.bare and repo.is_dirty(untracked_files=True):
            print(bcolors.warning("[DIRTY REPO]"), repo.working_tree_dir)
            num_dirty += 1
    print("\n", bcolors.bold("Total: {}/{}".format(num_dirty , len(repos))), "\n\n")

def __procress_parameters__():
    if len(sys.argv) <= 2: return {} 
    try:
        parametros = {}
        for i in range(3, len(sys.argv), 2):
            parametros[str(sys.argv[i])] = str(sys.argv[i+1])
        return parametros
    except:
        raise "Error al procesar parámetros"


#################################################
# MAIN COMMANDS
#################################################
def help_cmd(**kwargs):
    print(bcolors.error("\nError de sintaxis."))
    print(__doc__)


def repos(print=True, **kwargs):
    only_repos = []
    __search_repos__(only_repos, mypath)
    if print == True: __print_repos__(only_repos)
    return only_repos


def dirty(**kwargs):
    __get_dirty_repos__(*repos(print=False))


def connect(**kwargs):

    host = kwargs["--host"] if "--host" in kwargs else None
    user = kwargs["--user"] if "--user" in kwargs else str(getlogin())
    name = kwargs["--name"] if "--name" in kwargs else None
    if name == None or host == None:
        help_cmd()
        exit(1)

    cadena_conexion = "ssh://{}@{}".format(user, host)
    continuar = __pregunta_si_no__(pregunta="La cadena de conexión: "+ cadena_conexion + " es correcta?")
    if continuar:
        print("\n" + bcolors.header("Conectando repos...") + "\n")
        num_conected = 0
        for un_repo in repos(print=False):
            if not un_repo.bare:
                remote_path = cadena_conexion + un_repo.working_tree_dir
            elif un_repo.bare:
                remote_path = cadena_conexion + un_repo.git_dir
            remote = __create_remote__(un_repo, name, remote_path)
            if remote: num_conected += 1
        print("\n", bcolors.bold("Conectados: {}".format(num_conected)), "\n\n")
    else: 
        bcolors.error("Abortando")
        exit()


def clone(**kwargs):
    remote_host = kwargs["--remote"] if "--remote" in kwargs else None
    user = kwargs["--user"] if "--user" in kwargs else str(getlogin())
    name = kwargs["--name"] if "--name" in kwargs else None
    local_host = __obtain_local_name_host__(domain=True)
    local_name_host = __obtain_local_name_host__(domain=False)

    if name == None or remote_host == None or user == None:
        help_cmd()
        exit(1)

    import paramiko
    try:
        client = paramiko.SSHClient()
        client.load_system_host_keys()
        client.connect(hostname=remote_host, password=None, timeout=2) # Only ssh keys

        print("\n" + bcolors.header("Clonando repos...") + "\n")
        num_cloned = 0
        remote_conexion = "ssh://{}@{}".format(user, local_host)

        for un_repo in repos(print=False):
            if not un_repo.bare:
                local_ssh_path = f"{remote_conexion}:{un_repo.working_tree_dir}"
                remote_path = un_repo.working_tree_dir
                cmd_clone = f"git clone -o {local_name_host} {local_ssh_path} {remote_path}"
            elif un_repo.bare:
                local_ssh_path = remote_conexion + un_repo.git_dir
                remote_path = un_repo.git_dir
                cmd_clone = f"git clone --mirror {local_ssh_path} {remote_path}"

            # Comprobando si el repo ya existe
            _stdin, stdout, _stderr = client.exec_command(command=f'[ -d {remote_path} ]', timeout=2)
            cmd_code = stdout.channel.recv_exit_status()
            if(cmd_code == 0):
                print("\t", bcolors.warning("[WARNING]"), "Repo exists: ", remote_path)
            else:
                # Clonando repo por ssh...
                bare_msg = bcolors.warning(" [BARE] ") if un_repo.bare else ""
                print("\t", bcolors.info(f"[Clonando en {remote_host}...]"), bare_msg, cmd_clone)

                _stdin, stdout, _stderr = client.exec_command(command=cmd_clone, timeout=2)
                cmd_code = stdout.channel.recv_exit_status()
                if(cmd_code == 0): 
                    num_cloned+= 1 
                    print("\t", bcolors.ok("[Ok Cloned]"))
                else: print("\t", bcolors.error("[ERROR Cloning]"))
        print("\n", bcolors.bold("Clonados: {}".format(num_cloned)), "\n\n")

    except paramiko.ssh_exception.BadHostKeyException as e:
        print(bcolors.error("[ERROR]"), f" The server’s host key could not be verified: {str(e)}")
    except paramiko.ssh_exception.AuthenticationException as e:
        print(bcolors.error("[ERROR]"), f" Authentication failed: {str(e)}")
    except paramiko.ssh_exception.SSHException as e:
        print(bcolors.error("[ERROR]"), f" Error connecting or establishing an SSH session: {str(e)}")
    except Exception as e:
        print(bcolors.error("[ERROR]"), f" Ocurrió un error inesperado: {str(e.args)}")
    finally:
        if client: 
            client.close()
            try:
                del _stdin, stdout, _stderr # https://stackoverflow.com/a/61016663/1820838
            except UnboundLocalError:
                pass #Evita que no haya sido previamente declaradas (referenced before assignment)
        
            


def fetch(**kwargs):
    name_remote   = kwargs["--name"] if "--name" in kwargs else None
    path_script   = kwargs["--file"] if "--file" in kwargs else None
    __fetch_repos__(*repos(print=False), name_remote=name_remote, path_file_remote_script=path_script)

# Comandos posibles
switch_cmd = {
	"repos": repos,
	"dirty": dirty,
	"connect": connect,
    "fetch": fetch,
    "clone": clone,
    "help": help_cmd
}

#################################################
# MAIN SCRIPT
#################################################
try:
    mypath = sys.argv[1]
    mypath = abspath(mypath)
    command = sys.argv[2]
    parametros = __procress_parameters__()
except:
    help_cmd()
    exit()

# tomamos la función asociada a la variable y la invocamos
switch_cmd.get(command, help_cmd)(**parametros)


