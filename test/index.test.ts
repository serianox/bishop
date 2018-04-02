import * as path from "path";
import { assert } from "chai";
import { BSError } from "../lib/error";
import { Run, Task } from "../lib/index";
import { parseConfiguration } from "../lib/parser";

suite("Functional", () => {
    suite("#main()", () => {
        test("bad string", () => {
            assert.instanceOf(Run.getInstance("&", ["task1"]), BSError);
        });
        test("basic string", () => {
            const data = `
task1: task2 task3
task2: task2
task3:
`;
            const tasks = Run.getInstance(data, ["task1"]);
            assert.instanceOf(tasks, Run);
            (tasks as Run).go(1, false, () => {});
        });
        test("unresolved dependency", () => {
            const data = `
task1: task2 task3
task3:
`;
            const tasks = Run.getInstance(data, ["task1"]);
            assert.instanceOf(tasks, BSError);
        });
        test("unresolved goal", () => {
            const data = `
task1: task3
task3:
`;
            const tasks = Run.getInstance(data, ["task2"]);
            assert.instanceOf(tasks, BSError);
        });
        test(".bishop file", () => {
            const tasks = Run.getInstance(path.parse(".bishop"), ["ci"]);
            assert.instanceOf(tasks, Run);
            (tasks as Run).go(1, true, () => {});
        });
        test("simple run", () => {
            const data = `
task1:
    cmd = true
`;
            const tasks = Run.getInstance(data, ["task1"]);
            assert.instanceOf(tasks, Run);
            (tasks as Run).go(1, false, () => {});
        });
        test("allow-failure", () => {
            const data = `
task1:
    cmd = false
    allow-failure = true
`;
            const tasks = Run.getInstance(data, ["task1"]);
            assert.instanceOf(tasks, Run);
            (tasks as Run).go(1, false, () => { assert(false) });
        });
        test("disallow-failure", () => {
            const data = `
task1:
    cmd = false
    allow-failure = false
`;
            const tasks = Run.getInstance(data, ["task1"]);
            assert.instanceOf(tasks, Run);
            (tasks as Run).go(1, false, () => {});
        });
    });
});
