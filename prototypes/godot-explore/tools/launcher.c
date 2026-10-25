// Native macOS bundle entry point. Godot receives the packed project, not an editor path.
#include <mach-o/dyld.h>
#include <limits.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
int main(int argc, char **argv) {
 char executable[PATH_MAX], resolved[PATH_MAX], engine[PATH_MAX], pack[PATH_MAX];
 uint32_t length = sizeof executable;
 if (_NSGetExecutablePath(executable, &length) || !realpath(executable, resolved)) return 1;
 char *slash = strrchr(resolved, '/'); if (!slash) return 1; *slash = 0;
 if ((size_t)snprintf(engine, sizeof engine, "%s/Godot", resolved) >= sizeof engine ||
     (size_t)snprintf(pack, sizeof pack, "%s/../Resources/game.pck", resolved) >= sizeof pack) return 1;
 char **args = calloc((size_t)argc + 3, sizeof(char *)); if (!args) return 1;
 args[0] = engine; args[1] = "--main-pack"; args[2] = pack;
 for (int i = 1; i < argc; i++) args[i + 2] = argv[i];
 execv(engine, args); perror("Starting Godot"); free(args); return 1;
}
