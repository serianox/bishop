import * as program from "commander";
import * as os from "os";
import * as path from "path";
import { BSError } from "./error";
import { Run } from "./index";
import { debug, err, info, Level, setLevel } from "./logging";

/**
 * The command line options.
 */
interface Options {
    file?: string;
    jobs?: number;
    simulate?: boolean;
    silent?: boolean;
    debug?: boolean;
    args: string[];
}

/** The version of this module from the "package.json" file. */
const version = (() => {
    try {
        return require("../../package.json").version;
    } catch (e) {
        return "unknown";
    }
})();

program
    .version(version)
    .usage("[options] <task ...>")
    .option("-f, --file <file>", "bishop file")
    .option("-j, --jobs <jobs>", "number of jobs to start in parallel")
    .option("-S, --simulate", "simulate operations")
    .option("-s, --silent", "set silent")
    .option("-d, --debug", "set verbose");

/**
 * The main entry point of Bishop.
 *
 * @param argv the startup parameters as given on the command line
 * @param done the callback once the execution is finished
 */
export const main = (argv: string[], done: (exitCode: number) => void): void => {
    program.parse(argv);
    const start = Date.now();

    const options = program as Options;

    if (options.silent) {
        setLevel(Level.WARNING);
    }

    if (options.debug) {
        setLevel(Level.DEBUG);
    }

    info("Bishop " + version);
    debug(options.file!);

    const goals = new Array<string>();
    const args = new Map<string, string>();

    args.set("jobs", (options.jobs || os.cpus().length).toString());

    Object.entries(process.env).forEach(([key, value]) => { args.set(key, value!); });

    options.args.forEach(_ => {
        const match = _.match(/([^=]+)=(.*)/);

        if (match) {
            args.set(match[1], match[2]);
        } else {
            goals.push(_);
        }
    });

    const tasks = Run.getInstance(path.parse(options.file || ".bishop"), goals, args);

    if (tasks instanceof BSError) {
        err(tasks.message);
        if (tasks.stack) {
            debug(tasks.stack);
        }
        done(1);
        return;
    }

    const complete = (exitCode: number): () => void => () => {
        info("Completed in " + (Date.now() - start) / 1000 + "s");
        done(exitCode);
    };

    tasks.go(options.jobs || os.cpus().length, options.simulate || false, complete(0), complete(1));
    return;
};
