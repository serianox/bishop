/**
 * Logging levels.
 */
export enum Level {
    DEBUG,
    INFO,
    WARNING,
    ERROR,
}

/** The current global log level. */
let loglevel: Level = Level.INFO;

/**
 * Set current logging level. All messages strictly below logging level are discarded.
 *
 * @param level the new logging level
 */
export const setLevel = (level: Level) => {
    loglevel = level;
};

/**
 * Create a logging function from a log level.
 *
 * @param level the log level for the created function
 * @returns a logging level for the level given in paramter
 */
const log = (level: Level) => (message: string, ...parameters: any[]): void => {
    if (loglevel <= level) {
        console.log(message, ...parameters);
    }
};

/** Log a debug message. */
export const debug = log(Level.DEBUG);

/** Log an informative message. */
export const info = log(Level.INFO);

/** Log a warning. Execution should resume when an error is logged. */
export const warn = log(Level.WARNING);

/** Log an error. Execution should not resume when an error is logged. */
export const err = log(Level.ERROR);
