import * as child_process from "child_process";
import * as program from "commander";
import * as path from "path";
import { BSError } from "./error";
import { Run, Task } from "./index";
import { debug, info, Level, setLevel } from "./logging";

export interface Options {
    file?: string;
    simulate?: boolean;
    debug?: boolean;
    args: string[];
}

program
    .version("0.1.0")
    .usage("[options] <task ...>")
    .option("-f, --file <file>", "bishop file")
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
        //
    } else {
        const runTask = (task: Task | undefined): void => {
            if (!task) {
                return;
            }

            debug(task.name);
            if (task.command && !options.simulate) {
                info(task.command);
                const child = child_process.exec(task.command);

                child.on("close", (code) => {
                    debug(code.toString());
                    task.setDone();

                    return runTask(tasks.next());
                });
            } else {
                task.setDone();

                return runTask(tasks.next());
            }
        };

        runTask(tasks.next());
    }

    return 0;
}
