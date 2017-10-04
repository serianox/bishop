import { Parjs as p, ReplyKind } from "parjs";

class Comment {
    constructor(public content: string) {}
}

class Declaration {
    constructor(public name: string, public dependencies: string[]) {}
}

class Option {
    constructor(public name: string, public value: string) {}
}

const name = p.regexp(/[a-z]+/).map(_ => _[0]);
const rest = p.regexp(/[^\r\n]*/).map(_ => _[0]);
const colon = p.string(":").q;
const semicolon = p.string(";").q;
const equal = p.string("=").q;
const indent = p.regexp(/(    |\t)/).q;
const whitespace = p.regexp(/[ \t]*/).q;
const whitespace1 = p.regexp(/[ \t]/).q;
const newline = p.regexp(/(\r\n|\r|\n)/).q;
const newlinen = p.regexp(/(\r\n|\r|\n)*/).q;

const comment = semicolon.then(rest).map(_ => new Comment(_.trim()));

const option = indent.then(name).then(whitespace).then(equal).then(rest).map(_ => new Option(_[0], _[1].trim()));
const options = option.manySepBy(newline);
const declaration = name.then(whitespace).then(colon).then(name.manySepBy(whitespace));

const configuration = comment.or(declaration).or(option).manySepBy(newlinen).between(newlinen).then(p.eof);

/**
 * Generate an AST from a configuration file.
 *
 * @param input the configuration as a `string`
 * @return the result AST
 */
export const parseConfiguration = (input: string): boolean  => {
    console.log(input);
    const result = configuration.parse(input);
    switch (result.kind) {
        case ReplyKind.OK: {
            console.log(JSON.stringify(result.value, null, 4));
            return true;
        }
        default: {
            p.visualizer.visualize(result.trace);
            console.log(result.trace.reason);
            console.log(result.trace.location);
            return false;
        }
    }
};
