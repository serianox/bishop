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

    const goals = new Array<string>();
    const args = new Map<string, string>();

    args.set("jobs", (options.jobs || os.cpus().length).toString());

    Object.entries(process.env).forEach(([key, value]) => {args.set(key, value!); });

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

    tasks.go(options.jobs || os.cpus().length, options.simulate || false, () => process.exit(1));

    return 0;
};
