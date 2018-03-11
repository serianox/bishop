import * as child_process from "child_process";
import * as program from "commander";
import * as path from "path";
import { BSError } from "./error";
import { Run, Task } from "./index";
import { fyi, Level, setLevel } from "./logging";

interface Options {
    file?: string;
    verbose?: boolean;
    args: string[];
}

program
    .version("0.1.0")
    .usage("[options] <task ...>")
    .option("-f, --file <file>", "bishop file")
    .option("-v, --verbose", "set verbose");

program.parse(process.argv);

const options = program as Options;

const tasks = Run.getInstance(path.parse(options.file || ".bishop"), options.args);

if (tasks instanceof BSError) {
    //
} else {
    const runTask = (task: Task | undefined): void => {
        if (!task) {
            return;
        }

        fyi(task.name);
        if (task.command) {
            fyi(task.command);
            const child = child_process.exec(task.command);

            child.on("close", (code) => {
                fyi(code.toString());
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
