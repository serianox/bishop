import * as program from "commander";
import * as path from "path";
import { buildTasks } from "./index";
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

const tasks = buildTasks(path.parse(options.file || ".bishop"), options.args);
