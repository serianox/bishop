import * as program from "commander";
import * as os from "os";
import * as path from "path";
import { BSError } from "./error";
import { Run, Task } from "./index";
import { debug, err, info, Level, setLevel } from "./logging";

export interface Options {
    file?: string;
    jobs?: number;
    simulate?: boolean;
    silent?: boolean;
    debug?: boolean;
    args: string[];
}

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

export const main = (argv: string[]): number => {
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
        return 1;
    }

    const complete = (then: () => void): () => void => () => {
        info("Completed in " + (Date.now() - start) / 1000 + "s");
        then();
    };

    tasks.go(options.jobs || os.cpus().length, options.simulate || false, complete(() => { /**/ }), complete(() => process.exit(1)));

    return 0;
};
