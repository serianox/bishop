import * as program from "commander";
import * as path from "path";
import * as os from "os";
import { BSError } from "./error";
import { Run, Task } from "./index";
import { debug, err, info, Level, setLevel } from "./logging";

export interface Options {
    file?: string;
    jobs?: number;
    simulate?: boolean;
    debug?: boolean;
    args: string[];
}

program
    .version("0.1.0")
    .usage("[options] <task ...>")
    .option("-f, --file <file>", "bishop file")
    .option("-j, --jobs <jobs>", "number of jobs to start in parallel")
    .option("-S, --simulate", "simulate operations")
    .option("-d, --debug", "set verbose");

export const main = (argv: string[]): number => {
    program.parse(argv);

    const options = program as Options;

    if (options.debug) {
        setLevel(Level.DEBUG);
        debug("debug mode");
    }

    debug(argv.join(", "));
    info("args " + options.args.join(" "));
    info(options.file!);
    const tasks = Run.getInstance(path.parse(options.file || ".bishop"), options.args);

    if (tasks instanceof BSError) {
        err(tasks.message);
        if (tasks.stack) {
            err(tasks.stack);
        }
        return 1;
    }

    tasks.go(options.jobs || os.cpus().length, options.simulate || false);

    return 0;
}
