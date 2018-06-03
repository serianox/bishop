import * as fs from "fs";
import * as p from "parsimmon";
import { ParsedPath } from "path";
import { BSError } from "./error";

/**
 * A comment in a Bishop file. This exist in the AST in case one day comments are used as a mean of documentation.
 */
export class Comment {
    /**
     * Default constructor.
     *
     * @param content the content of the comment, including formating
     */
    constructor(public readonly content: string) { }
}

/**
 * An option for a task declaration.
 */
export class Option {
    /**
     * Default constructor.
     *
     * @param name the option name
     * @param value the option value
     */
    constructor(public readonly name: string, public readonly value: string = "true") { }
}

/**
 * A task declaration.
 */
export class Declaration {
    /**
     * Default constructor.
     *
     * @param name the task name
     * @param dependencies the list of dependencies
     * @param options the list of options
     */
    constructor(public readonly name: string, public readonly dependencies: string[], public readonly options: Option[]) { }
}

/** The AST of a Bishop file. */
export type AST = Array<Comment | Declaration>;

const identifier = p.regexp(/[a-zA-Z][a-zA-Z0-9]*([-_.][a-zA-Z0-9]+)*/);
const remainder = p.regexp(/[^\r\n\u0085\u2028\u2029]*/).map(_ => _.trim());
const empty = p.string("");
const colon = p.string(":");
const semicolon = p.string(";");
const equal = p.string("=");
const indent = p.regexp(/[ \f\t\v\u00A0]+/);
const whitespace = p.regexp(/[ \f\t\v\u00A0]*/);
const newline = p.regexp(/[\n\u0085\u2028\u2029]|\r\n?/);

/** A parser for comments. */
const comment = p.sepBy1(whitespace.then(semicolon).then(remainder), newline).map(_ => new Comment(_.join("\n")));

/** A parser for an option. */
const option = p.alt(p.seq(indent, identifier, whitespace, equal, remainder).map(_ => new Option(_[1], _[4])), p.seq(indent, identifier, whitespace).map(_ => new Option(_[1])));

/** A parser for a task declaration. */
const declaration = p.seq(identifier, whitespace, colon, whitespace, p.sepBy(identifier, whitespace), whitespace, newline.then(option).many()).map(_ => new Declaration(_[0], _[4], _[6]));

/** A parser for a Bishop file. */
const configuration = newline.many().then(p.sepBy(p.alt(declaration, comment), newline.atLeast(1))).skip(newline.many()).skip(p.eof);

/**
 * Generate an AST from a configuration.
 *
 * @param input the configuration as a `string` or a `ParsedPath`
 * @return the result `AST` or an instance of `BSError`
 */
export const parseConfiguration = (input: string | ParsedPath): AST | BSError => {
    const isParsedPath = (_: string | ParsedPath): _ is ParsedPath => (_ as ParsedPath).dir !== undefined;

    if (isParsedPath(input)) {
        try {
            input = fs.readFileSync(input.dir + input.base, "utf8");
        } catch (error) {
            return new BSError(error);
        }
    }

    const result = configuration.parse(input);

    if (!result.status) {
        return new BSError("parsing failed");
    }

    return result.value;
};
