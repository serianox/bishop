export class Task {
    private name: string;
    private dependencies: Task[];

    public constructor(name: string, dependencies: Task[]) {
        this.name = name;
        this.dependencies = dependencies;
    }

    public getDependencies(): Task[] {
        return [].concat.apply(this.dependencies, this.dependencies.map(_ => _.getDependencies()));
    }
}

export const buildTasks = (tasks: Array<[string, string[]]>): Task[] => {
    const map = new Map<string, Task>();

    return buildTasksRec(tasks, map);
};

const buildTasksRec = (tasks: Array<[string, string[]]>, tasks2: Map<string, Task>): Task[] => {
    const [head, ...tail] = tasks;

    if (!head) {
        return [];
    }

    const task = new Task(head[0], head[1].map(_ => tasks2.get(_) || new Task("a", [])));
    tasks2.set(head[0], task);

    return [task].concat(buildTasksRec(tail, tasks2));
};
