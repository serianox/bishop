import * as program from "commander";

program
    .version("0.1.0")
    .option("-f, --file <file>", "bishop file");

program.parse(process.argv);
