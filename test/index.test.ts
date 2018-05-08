import { assert } from "chai";
import * as path from "path";
import { BSError } from "../lib/error";
import { Run, Task } from "../lib/index";
import { parseConfiguration } from "../lib/parser";

suite("Functional", () => {
    suite("#main()", () => {
        test("bad string", () => {
            assert.instanceOf(Run.getInstance("&", ["task1"], new Map<string, string>()), BSError);
        });
        test("basic string", (done) => {
            const data = `
task1: task2 task3
task2: task2
task3:
`;
            const tasks = Run.getInstance(data, ["task1"], new Map<string, string>());
            assert.instanceOf(tasks, Run);
            (tasks as Run).go(1, false, done, assert.fail);
        });
        test("unresolved dependency", () => {
            const data = `
task1: task2 task3
task3:
`;
            const tasks = Run.getInstance(data, ["task1"], new Map<string, string>());
            assert.instanceOf(tasks, BSError);
        });
        test("unresolved goal", () => {
            const data = `
task1: task3
task3:
`;
            const tasks = Run.getInstance(data, ["task2"], new Map<string, string>());
            assert.instanceOf(tasks, BSError);
        });
        test(".bishop file", (done) => {
            const tasks = Run.getInstance(path.parse(".bishop"), ["ci"], new Map<string, string>());
            assert.instanceOf(tasks, Run);
            (tasks as Run).go(1, true, done, assert.fail);
        });
        test("simple run", (done) => {
            const data = `
task1:
    cmd = true
`;
            const tasks = Run.getInstance(data, ["task1"], new Map<string, string>());
            assert.instanceOf(tasks, Run);
            (tasks as Run).go(1, false, done, assert.fail);
        });
        test("allow-failure", (done) => {
            const data = `
task1:
    cmd = false
    allow-failure = true
`;
            const tasks = Run.getInstance(data, ["task1"], new Map<string, string>());
            assert.instanceOf(tasks, Run);
            (tasks as Run).go(1, false, done, assert.fail);
        });
        test("disallow-failure", (done) => {
            const data = `
task1:
    cmd = false
    allow-failure = false
`;
            const tasks = Run.getInstance(data, ["task1"], new Map<string, string>());
            assert.instanceOf(tasks, Run);
            (tasks as Run).go(1, false, assert.fail, done);
        });
    });
});
