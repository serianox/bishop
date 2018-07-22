import * as child_process from "child_process";
import { ParsedPath } from "path";
import { BSError } from "./error";
import { debug, info, warn } from "./logging";
import { Declaration, parseConfiguration } from "./parser";

/** The different states for a task. */
export enum State {
    Unreachable,
    NotStarted,
    InProgress,
    Done,
}

/** A mark for running various graph algorithms. */
export enum Mark {
    Marked,
    Unmarked,
}

/**
 * A Bishop task.
 */
export class Task {
    /**
     * Default constructor.
     *
     * @param name the task's name
     * @param dependenciesName the names of the task's dependencies
     * @param allowFailure `true` if the build should not fail when the task returns non-zero
     * @param silent `true` if the task should not write to console
     * @param requestedJobs number of jobs this task consumme
     * @param weight weight of the task
     * @param command command run by the task
     */
    public constructor(
        public readonly name: string,
        private readonly dependenciesName: string[],
        public readonly allowFailure: boolean,
        public readonly silent: boolean,
        public readonly requestedJobs: number,
        public readonly weight: number,
        public readonly command?: string,
    ) { }

    /** Current state of the task. */
    private _state: State = State.Unreachable;

    /** Mark of the task for running graph algorithms. */
    public mark: Mark = Mark.Unmarked;

    /** Number of jobs the task is currently consuming. */
    public currentJobs: number = 0;

    /** List of task's dependencies. */
    private _dependencies: Task[] = [];

    /** Current state of the task. */
    public get state(): State { return this._state; }

    /** List of task's dependencies. */
    public get dependencies(): Task[] { return this._dependencies.slice(); }

    /**
     * Create an instance of `Task` from an instance of `Declaration`.
     *
     * @param input the instance of Declaration
     * @param options the list of options applicable to the task
     * @return the instance of `Task`
     */
    public static getInstance = (input: Declaration, options: Map<string, string>): Task => {
        const getBooleanOr = (name: string, or: boolean): boolean => {
            const search = input.options.find(_ => _.name === name);
            return search ? search.value === "true" : or;
        };

        const getNumberOr = (name: string, or: number): number => {
            const search = input.options.find(_ => _.name === name);
            return search ? parseInt(search.value, 10) : or;
        };

        const getStringOr = (name: string, or?: string): string | undefined => {
            const search = input.options.find(_ => _.name === name);
            return search ? search.value : or;
        };

        // TODO should cap the number of jobs for a task to the maximum number of jobs allowed
        // TODO should check that jobs > 0
        // TODO should check parameter consistency
        const allowFailure = getBooleanOr("allow-failure", false);
        const silent = getBooleanOr("silent", false);
        const jobs = getNumberOr("jobs", 1);
        const weight = getNumberOr("weight", 0);

        let cmd = getStringOr("cmd");

        if (cmd) {
            // do string interpolation in the command
            cmd = cmd
                .split(/(\([a-zA-Z][a-zA-Z0-9]*(?:[-_.][a-zA-Z0-9]+)*\))/)
                .map(_ => {
                    const match = _.match(/\(([^)]+)\)/);

                    if (!match) {
                        return _;
                    }

                    if (options.get(match[1])) {
                        return options.get(match[1]);
                    }

                    const replacement = getStringOr(match[1]);

                    if (replacement) {
                        return replacement;
                    }

                    warn("command interpolation failed for task `" + input.name + "`: value `" + match[1] + "` not found");

                    return _;
                })
                .join("");
        }

        return new Task(input.name, input.dependencies, allowFailure, silent, jobs, weight, cmd);
    }

    /**
     * Resolve the task's dependencies from their names to their actual instance of `Task`. Ensure that no task have
     * undeclared dependency.
     *
     * @param tasks the map of tasks using their respective names as key
     * @return undefined, or `BSError` in case of error
     */
    public resolve = (tasks: Map<string, Task>): undefined | BSError => {
        for (const dependencyName of this.dependenciesName) {
            const dependency = tasks.get(dependencyName);

            if (dependency === undefined) {
                return new BSError("unresolved dependency `" + dependencyName + "` for task `" + this.name + "`");
            }

            this._dependencies.push(dependency);
        }

        return;
    }

    /** Set this task as not started. */
    public setNotStarted = () => {
        if (this._state !== State.Unreachable) {
            warn("Setting `" + this.name + "` as state notStarted, but was in state `" + this.state + "`");
        }

        this._state = State.NotStarted;
    }

    /** Set this task as in progress. */
    public setInProgress = () => {
        if (this._state !== State.NotStarted) {
            warn("Setting `" + this.name + "` as state inProgress, but was in state `" + this.state + "`");
        }

        this._state = State.InProgress;
    }

    /** Set this task as done. */
    public setDone = () => {
        if (this._state !== State.InProgress) {
            warn("Setting `" + this.name + "` as state Done, but was in state `" + this.state + "`");
        }

        this._state = State.Done;
    }
}

/**
 * An instance of a Bishop execution run.
 */
export class Run {
    /**
     * Default constructor.
     *
     * @param _reachable the list of reachable tasks
     * @param _ready the list of tasks ready to run
     * @param _waiting the list of tasks waiting on their dependencies
     */
    private constructor(
        private _reachable: Task[],
        private _ready: Task[],
        private _waiting: Task[],
    ) { }

    /**
     * Create an instance of `Run`.
     *
     * @param input the input as either a `ParsedPath`, or a `string` representing a Bishop file's content
     * @param goals the list of tasks declared as specific goals
     * @param options the list of global options
     * @return an instance of `Run`, or an instance of `BSError` if the creation fails
     */
    public static getInstance = (input: string | ParsedPath, goals: string[], options: Map<string, string>): Run | BSError => {
        const ast = parseConfiguration(input);

        if (ast instanceof Error) {
            return new BSError("parsing error", ast);
        }

        const map = new Map<string, Task>();
        const declarations = ast.filter((_): _ is Declaration => _ instanceof Declaration);

        const tasks = new Array<Task>();

        for (const declaration of declarations) {
            const task = Task.getInstance(declaration, options);

            if (map.get(task.name)) {
                return new BSError("duplicated task `" + task.name + "`");
            }

            map.set(task.name, task);
            tasks.push(task);
        }

        for (const task of tasks) {
            const result = task.resolve(map);

            if (result instanceof BSError) {
                return result;
            }
        }

        for (const goal of goals) {
            if (map.get(goal) === undefined) {
                return new BSError("unresolved goal ̀ " + goal + "`");
            }
        }

        const detectCycles = (children: Task[]): undefined | BSError => {
            for (const child of children) {
                if (child.mark === Mark.Marked) {
                    return new BSError("cycle detected for task `" + child.name + "`");
                }

                child.mark = Mark.Marked;

                const result = detectCycles(child.dependencies);

                if (result instanceof BSError) {
                    return result;
                }

                child.mark = Mark.Unmarked;
            }

            return;
        };

        const cycles = detectCycles(goals.map(_ => map.get(_)!));

        if (cycles instanceof BSError) {
            return cycles;
        }

        const computeReachable = (closed: Task[], open: Task[]): Task[] => {
            const next = open.pop();

            if (next === undefined) {
                return closed;
            }

            if (closed.indexOf(next) === -1) {
                next.setNotStarted();
                closed.push(next);

                next.dependencies.forEach(dependency => {
                    open.push(dependency);
                });
            }

            return computeReachable(closed, open);
        };

        const reachable = computeReachable([], goals.map(_ => map.get(_)!));

        const ready: Task[] = [];
        const waiting: Task[] = [];

        reachable.forEach(task => {
            if (task.dependencies.length === 0) {
                ready.push(task);
            } else {
                waiting.push(task);
            }
        });

        return new Run(reachable, ready, waiting);
    }

    /**
     * Update the internal state and pop the next task that should be run.
     *
     * @return the next task that should be run, or `undefined` if no task are available.
     */
    private next = (): Task | undefined => {
        debug("waiting tasks: " + this._waiting.map(_ => "`" + _.name + "`").join(", "));
        debug("ready tasks: " + this._ready.map(_ => "`" + _.name + "`").join(", "));

        // remove tasks in the ready set that have already been started
        const ready = this._ready.filter(task => task.state === State.NotStarted);

        const waiting: Task[] = [];

        this._waiting.forEach(task => {
            // tasks in the waiting set are ensured to have > 1 dependency
            if (task.dependencies.reduce((result, dependency) => result && dependency.state === State.Done, true)) {
                debug("task `" + task.name + "` moved to ready set");
                ready.push(task);
            } else {
                debug("task `" + task.name + "` left in waiting set");
                waiting.push(task);
            }
        });

        ready.sort((l, r) => r.weight - l.weight);

        this._ready = ready;
        this._waiting = waiting;

        return this._ready[0];
    }

    /** The number of tasks currently running. */
    private _running: number = 0;

    /**
     * Start a new task.
     *
     * @param task the task to run
     */
    private start = (task: Task): void => {
        ++this._running;
    }

    /**
     * Complete the execution of a task.
     *
     * @param task the task run
     */
    private complete = (task: Task): void => {
        --this._running;
    }

    /**
     * Check if this run is finished.
     *
     * @return `true` if all the tasks have been run, `false` otherwise
     */
    private isFinished = (): boolean => {
        return this._waiting.length + this._ready.length + this._running === 0;
    }

    /**
     * Start the execution.
     *
     * @param jobs the number of parallel jobs available
     * @param simulate `true` if no task should be really executed
     * @param done a callback when execution completes without error
     * @param error a callback when execution completes with an error
     */
    public go = (jobs: number, simulate: boolean): Promise<void | BSError> => {
        const run = this;

        return new Promise((resolve, reject) => {
            const maxJobs = jobs;

            const runTask = (): void => {
                const runNext = (currentTask: Task): void => {
                    jobs += currentTask.currentJobs;

                    run.complete(currentTask);
                    currentTask.setDone();

                    runTask();
                };

                const task = run.next();

                if (!task) {
                    if (run.isFinished()) {
                        resolve();
                    }

                    return;
                }

                const currentJobs = Math.min(task.requestedJobs, maxJobs);

                if (currentJobs > jobs) {
                    debug("task `" + task.name + "` not run now, need " + currentJobs + " job(s), got " + jobs);
                    return;
                }

                task.currentJobs = currentJobs;
                jobs -= task.currentJobs;

                const job = jobs;

                info("[" + job + "] " + task.name);
                run.start(task);
                task.setInProgress();
                const start = Date.now();
                if (task.command && !simulate) {
                    info("[" + job + "] " + task.name + ": " + task.command);

                    const child = child_process.exec(task.command);

                    if (!task.silent) {
                        child.stdout.on("data", (data) => process.stdout.write(data.toString()));
                        child.stderr.on("data", (data) => process.stderr.write(data.toString()));
                    }

                    child.on("close", (code) => {
                        info("[" + job + "] " + task.name + ": completed in " + (Date.now() - start) / 1000 + "s");
                        info("[" + job + "] " + task.name + ": returned " + code);

                        if (code !== 0 && !task.allowFailure) {
                            reject(new BSError("task returned an error (" + code + ")"));

                            return;
                        }

                        runNext(task);
                    });

                    if (jobs !== 0) {
                        runTask();
                    }
                } else {
                    runNext(task);
                }
            };

            runTask();
        });
    }
}
