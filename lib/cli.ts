import * as program from "commander";

interface Options {
    file?: string;
}

program
    .version("0.1.0")
    .option("-f, --file <file>", "bishop file");

program.parse(process.argv);

const opts = program.opts as Options;
