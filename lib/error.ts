export class BSError extends Error {
    constructor(message: string, cause?: Error) {
        super(message);

        Object.setPrototypeOf(this, BSError.prototype);

        if (cause !== undefined) {
            const thisstack = this.stack!.split("\n");
            const causestack = cause.stack!.split("\n");

            let index = 1;
            for (;;) {
                if (thisstack[thisstack.length - index] !== causestack[causestack.length - index]) {
                    break;
                }

                ++index;
            }

            this.stack = causestack.slice(0, causestack.length - index + 1).concat(thisstack[0]).concat(thisstack.slice(2)).join("\n");
        }
    }
}
