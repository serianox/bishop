import { ParsedPath } from "path";
import { AST, Comment, Declaration, Option, parseConfiguration } from "./parser";

export enum State {
    NotStarted,
    InProgress,
    Done,
}

export class Task {
    public constructor(public readonly name: string, private readonly dependenciesName: string[], private readonly tasks: Map<string, Task>) {}

    public state: State = State.NotStarted;

    public dependencies: Task[];

    public resolve(): boolean {
        if (!this.dependenciesName.reduce((a, v) => a && this.tasks.has(v), true)) {
            return false;
        }

        this.dependencies = this.dependenciesName.map(_ => this.tasks.get(_)!);

        return true;
    }
}

export const buildTasks = (input: string | ParsedPath, goals: string[]): Task[] | string => {
    const ast = parseConfiguration(input);

    if (typeof ast === "string") {
        return "parsing error";
    }

    const map = new Map<string, Task>();
    const declarations: Declaration[] = ast.filter((_): _ is Declaration => _ instanceof Declaration);

    const tasks = declarations.map(_ => {
        const name = _.name;
        const task = new Task(name, _.dependencies, map);
        map.set(name, task);
        return task;
    });

    if (!tasks.reduce((a, v) => a && v.resolve(), true)) {
        return "unresolved dependency";
    }

    if (goals.reduce((a, v) => a && map.get(v) !== undefined, true)) {
        return "unresolved goal";
    }

    return goals.map(_ => map.get(_)!);
};

export const getNextTasks = (tasks: Task[]): Task[] | null => {
    return null;
};
