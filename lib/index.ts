import * as child_process from "child_process";
import { ParsedPath } from "path";
import { BSError } from "./error";
import { AST, Comment, Declaration, Option, parseConfiguration } from "./parser";
import { debug, err, info } from "./logging";

export enum State {
    Unreachable,
    NotStarted,
    InProgress,
    Done,
}

export class Task {
    public constructor(
        public readonly name: string,
        private readonly dependenciesName: string[],
        public readonly allowFailure: boolean,
        public readonly command?: string,
    ) { }

    private _state: State = State.Unreachable;

    private _dependencies: Task[] = [];

    public get state(): State { return this._state; }

    public get dependencies(): Task[] { return this._dependencies.slice(); }

    public static getInstance = (input: Declaration): Task => {
        const getBooleanOr = (name: string, or: boolean): boolean => {
            const search = input.options.find(_ => _.name === name);
            return search? search.value == "true": or;
        }

        const getStringOr = (name: string, or?: string): string | undefined => {
            const search = input.options.find(_ => _.name === name);
            return search? search.value: or;
        }

        return new Task(input.name, input.dependencies, getBooleanOr("allow-failure", false), getStringOr("cmd", undefined));
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

    //public get reachable(): Task[] { return this._reachable.slice(); }

    //public get ready(): Task[] { return this._ready.slice(); }

    //public get waiting(): Task[] { return this._waiting.slice(); }

    public static getInstance = (input: string | ParsedPath, goals: string[]): Run | BSError => {
        const ast = parseConfiguration(input);

        if (ast instanceof Error) {
            return new BSError("parsing error", ast);
        }

        const map = new Map<string, Task>();
        const declarations: Declaration[] = ast.filter((_): _ is Declaration => _ instanceof Declaration);

        const tasks = declarations.map(_ => {
            const task = Task.getInstance(_);
            map.set(task.name, task);
            return task;
        });

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

    private next = (): Task | undefined => {
        const waiting: Task[] = [];

        this._waiting.forEach(task => {
            if (task.dependencies.reduce((result, dependency) => result && dependency.state !== State.Done, true)) {
                waiting.push(task);
            } else {
                this._ready.push(task);
            }
        });

        this._waiting = waiting;

        return this._ready.pop();
    }

    private isFinished = (): boolean => {
        return this._waiting.length + this._ready.length === 0;
    }

    public go = (jobs: number, simulate: boolean, error: () => void): void => {
        const runTask = (): void => {
            const runNext = (task: Task, code: number, job: number): void => {
                info("[" + job + "] " + task.name + ": returned " + code.toString());

                if (code !== 0 && !task.allowFailure) {
                    error();
                }

                task.setDone();

                ++jobs;

                runTask();
            }

            if (this.isFinished()) {
                return;
            }

            const task = this.next();

            if (!task) {
                return;
            }

            --jobs;
            const job = jobs;

            info("[" + job + "] " + task.name);
            if (task.command && !simulate) {
                info("[" + job + "] " + task.name + ": " + task.command);

                const child = child_process.exec(task.command);
                child.on("close", (code) => runNext(task, code, job));
            } else {
                runNext(task, 0, job);
            }

            if (jobs !== 0) {
                runTask();
            }
        }

        runTask();
    }
}
