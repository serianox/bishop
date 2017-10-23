import * as program from "commander";

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
