import * as child_process from "child_process";
import { ParsedPath } from "path";
import { BSError } from "./error";
import { debug, err, info, warn } from "./logging";
import { AST, Comment, Declaration, Option, parseConfiguration } from "./parser";

export enum State {
    Unreachable,
    NotStarted,
    InProgress,
    Done,
}

export enum Mark {
    Marked,
    Unmarked,
}

export class Task {
    public constructor(
        public readonly name: string,
        private readonly dependenciesName: string[],
        public readonly allowFailure: boolean,
        public readonly silent: boolean,
        public readonly requestedJobs: number,
        public readonly weight: number,
        public readonly command?: string,
    ) { }

    private _state: State = State.Unreachable;

    public mark: Mark = Mark.Unmarked;

    public currentJobs: number = 0;

    private _dependencies: Task[] = [];

    public get state(): State { return this._state; }

    public get dependencies(): Task[] { return this._dependencies.slice(); }

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

                    return _;
                })
                .join("");
        }

        return new Task(input.name, input.dependencies, allowFailure, silent, jobs, weight, cmd);
    }

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

    public setNotStarted = () => {
        if (this._state === State.Unreachable) {
            this._state = State.NotStarted;
        }
    }

    public setDone = () => {
        if (this._state === State.NotStarted) {
            // TODO
            this._state = State.Done;
        }
    }
}

export class Run {
    private constructor(
        private _reachable: Task[],
        private _ready: Task[],
        private _waiting: Task[],
    ) { }

    // public get reachable(): Task[] { return this._reachable.slice(); }

    // public get ready(): Task[] { return this._ready.slice(); }

    // public get waiting(): Task[] { return this._waiting.slice(); }

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

        const computeReachable = (closed: Task[], open: Task[]): Task[] | BSError => {
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

        if (reachable instanceof BSError) {
            return reachable;
        }

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

    private next = (): Task | undefined => {
        debug("waiting tasks: " + this._waiting.map(_ => "`" + _.name + "`").join(", "));
        debug("ready tasks: " + this._ready.map(_ => "`" + _.name + "`").join(", "));

        const waiting: Task[] = [];

        this._waiting.forEach(task => {
            // tasks in the waiting set are ensured to have > 1 dependency
            if (task.dependencies.reduce((result, dependency) => result && dependency.state === State.Done, true)) {
                debug("task `" + task.name + "` moved to ready set");
                this._ready.push(task);
            } else {
                debug("task `" + task.name + "` left in waiting set");
                waiting.push(task);
            }
        });

        this._waiting = waiting;

        return this._ready.pop();
    }

    private _running: number = 0;

    private start = (task: Task): void => {
        ++this._running;
    }

    private complete = (task: Task): void => {
        --this._running;
    }

    private isFinished = (): boolean => {
        return this._waiting.length + this._ready.length + this._running === 0;
    }

    public go = (jobs: number, simulate: boolean, done: () => void, error: () => void): void => {
        const maxJobs = jobs;

        const runTask = (): void => {
            const runNext = (currentTask: Task): void => {
                jobs += currentTask.currentJobs;

                this.complete(currentTask);
                currentTask.setDone();

                runTask();
            };

            if (this.isFinished()) {
                done();
                return;
            }

            const task = this.next();

            if (!task) {
                return;
            }

            const currentJobs = Math.min(task.requestedJobs, jobs);

            if (currentJobs > jobs) {
                debug("task `" + task.name + "` not run now, need " + currentJobs + " job(s), got " + jobs);
                return;
            }

            task.currentJobs = currentJobs;
            jobs -= task.currentJobs;

            const job = jobs;

            info("[" + job + "] " + task.name);
            this.start(task);
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
                        if (error) {
                            error();
                        }

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
    }
}
