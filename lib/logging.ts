export enum Level {
    DEBUG,
    INFO,
    WARNING,
    ERROR,
}

let loglevel: Level = Level.WARNING;

export const setLevel = (level: Level) => {
    loglevel = level;
};

const log = (level: Level) => (message: string, ...parameters: any[]): void => {
    if (loglevel <= level) {
        console.log(message, ...parameters);
    }
};

export const debug = log(Level.DEBUG);

export const info = log(Level.INFO);

export const warn = log(Level.WARNING);

export const err = log(Level.ERROR);
