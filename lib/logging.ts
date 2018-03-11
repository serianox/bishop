export enum Level {
    FYI,
    WTF,
    OMG,
}

let loglevel: Level = Level.WTF;

export const setLevel = (level: Level) => {
    loglevel = level;
};

export const fyi = (message: string, ...parameters: any[]) => {
    if (loglevel >= Level.FYI) {
        console.log(message, ...parameters);
    }
};

export const wtf = (message: string, ...parameters: any[]) => {
    if (loglevel >= Level.FYI) {
        console.warn(message, ...parameters);
    }
};

export const omg = (message: string, ...parameters: any[]) => {
    if (loglevel >= Level.FYI) {
        console.error(message, ...parameters);
    }
};
