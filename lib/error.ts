/**
 * The class used for Bishop error management. It can compose from an existing `Error` instance and update the
 * stacktrace accordingly.
 */
export class BSError extends Error {
    /**
     * Build an error from a message, or compose from an existing error and optionaly add a message.
     * If `message` is an instance of `string`, build an instance of `BSError` and use the message as the error
     * message. If `message` is an instance of `Error`, build an instance of `BSError` and keep the information
     * form the original error. If `message` is an instance of `string` and `cause` is specified, build an instance of
     * `BSError`, keep the stacktrace information of the original cause and update the message.
     *
     * @param message the message of the error
     * @param cause the original `Error` causing this error
     */
    constructor(message: string | Error, cause?: Error) {
        if (message instanceof Error) {
            cause = message;
            message = message.message;
        }

        super(message);

        Object.setPrototypeOf(this, BSError.prototype);

        if (cause !== undefined) {
            // The idea is to compose a new stacktrace to both keep the location of the cause and still have the
            // location of the error we are creating. We compare both traces line per line from the bottom. Once we
            // reach a difference, we put on top the remainder of the one of the new error on top, then the one of the
            // cause.
            //
            // Cause         Error         BSError
            //   at file:10    at file:20    at file:10
            //   at file:30    at file:21    at file:20
            //   at file:31    at file:30    at file:21
            //                 at file:31    at file:30
            //                               at file:31
            const thisstack = this.stack!.split("\n");
            const causestack = cause.stack!.split("\n");

            let index = 1;
            for (; ;) {
                if (thisstack[thisstack.length - index] !== causestack[causestack.length - index]) {
                    break;
                }

                ++index;
            }

            this.stack = causestack.slice(0, causestack.length - index + 1).concat(thisstack[0]).concat(thisstack.slice(2)).join("\n");
        }
    }
}
