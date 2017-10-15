import { AST, Comment, Declaration, Option } from "./parser";

export class Task {
    public constructor(public readonly name: string, private readonly dependenciesName: string[], private readonly tasks: Map<string, Task>) {}

    public dependencies: Task[];

    public resolve(): boolean {
        if (!this.dependenciesName.reduce((a, v) => a && this.tasks.has(v), true)) {
            return false;
        }

        this.dependencies = this.dependenciesName.map(_ => this.tasks.get(_)!);

        return true;
    }
}

export const buildTasks = (ast: AST): Map<string, Task> | null => {
    const map = new Map<string, Task>();
    const declarations: Declaration[] = ast.filter((_): _ is Declaration => _ instanceof Declaration);

    const tasks = declarations.map(_ => {
        const name = _.name;
        const task = new Task(name, _.dependencies, map);
        map.set(name, task);
        return task;
    });

    if (!tasks.reduce((a, v) => a && v.resolve(), true)) {
        return null;
    }

    return map;
};
