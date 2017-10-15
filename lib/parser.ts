import * as p from "parsimmon";

class Comment {
    constructor(public content: string) {}
}

class Option {
    constructor(public name: string, public value: string) {}
}

class Declaration {
    constructor(public name: string, public dependencies: string[], public options: Option[]) {}
}

const name = p.regexp(/[a-zA-Z][a-zA-Z0-9]*([-_.][a-zA-Z0-9]+)*/);
const rest = p.regexp(/[^\r\n\u0085\u2028\u2029]*/).map(_ => _.trim());
const empty = p.string("");
const colon = p.string(":");
const semicolon = p.string(";");
const equal = p.string("=");
const indent = p.regexp(/[ \f\t\v\u00A0]+/);
const whitespace = p.regexp(/[ \f\t\v\u00A0]*/);
const newline = p.regexp(/[\n\u0085\u2028\u2029]|\r\n?/);

const comment = p.sepBy1(whitespace.then(semicolon).then(rest), newline).map(_ => new Comment(_.join("\n")));

const option = p.seq(indent, name, whitespace, equal, rest).map(_ => new Option(_[1], _[4]));

const declaration = p.seq(name, whitespace, colon, whitespace, p.sepBy(name, whitespace), whitespace, newline.then(option).many()).map(_ => new Declaration(_[0], _[4], _[6]));

const configuration = newline.many().then(p.sepBy(p.alt<Declaration | Comment>(declaration, comment), newline.atLeast(1))).skip(newline.many()).skip(p.eof);

/**
 * Generate an AST from a configuration file.
 *
 * @param input the configuration as a `string`
 * @return the result AST
 */
export const parseConfiguration = (input: string): boolean => {
    console.log(input);
    const result = configuration.parse(input);
    switch (result.status) {
        case true: {
            console.log(JSON.stringify(result.value, undefined, 4));
            return true;
        }
        case false: {
            console.log(result.expected);
            console.log(result.index);
            return false;
        }
    }
};
