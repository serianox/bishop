import * as program from "commander";
import * as path from "path";
import { buildTasks } from "./index";

interface Options {
    file?: string;
    args: string[];
}

program
    .version("0.1.0")
    .usage("options] <task ...>")
    .option("-f, --file <file>", "bishop file");

program.parse(process.argv);

const options = program as Options;

const tasks = buildTasks(path.parse(options.file || ".bishop"), options.args);
