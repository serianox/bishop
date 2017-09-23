import { Parjs as p, ReplyKind } from "parjs";

const name = p.regexp(/\w+/);
const colon = p.string(":").q;
const semicolon = p.string(";").q;
const equal = p.string("=").q;
const indent = p.regexp(/(    |\t)/).q;
const whitespace = p.regexp(/[ \t]*/).q;
const newline = p.regexp(/(\r\n|\r|\n)*/).q;
const newline1 = p.regexp(/(\r\n|\r|\n)+/).q;

const comment = semicolon.then(p.regexp(/[^\r\n]*/));
const declaration = name.then(whitespace).then(colon).then(name.manySepBy(whitespace));
const option = indent.then(name).then(whitespace).then(equal).then(p.regexp(/.*/));

const options = newline1.then(option).many();

const configuration = comment.or(declaration.then(options)).manySepBy(newline1).between(newline);

export const parseConfiguration = (input: string): boolean  => {
    const result = configuration.parse(input);
    switch (result.kind) {
        case ReplyKind.OK: {
            console.log(result.value);
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
