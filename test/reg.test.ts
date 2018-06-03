import { assert } from "chai";
import * as path from "path";
import { BSError } from "../lib/error";
import { Run, Task } from "../lib/index";
import { parseConfiguration } from "../lib/parser";

suite("Non-regressions", () => {
    test("issue #15", (done) => {
        const data = `
test: build
	cmd = cat eWshfNIQ8g && rm eWshfNIQ8g

build: transpile copy-bin

transpile:
	cmd = sleep 2 && touch eWshfNIQ8g

copy-bin:
	cmd = true
`;
        const tasks = Run.getInstance(data, ["test"], new Map<string, string>());
        assert.instanceOf(tasks, Run);
        (tasks as Run).go(4, false, done, assert.fail);
    });
    test("issue #16", () => {
        const data = `
task1: task2 task3
task2: task2
task3:
`;
        const tasks = Run.getInstance(data, ["task1"], new Map<string, string>());
        assert.instanceOf(tasks, BSError);
    });
    test("issue #18", (done) => {
        const data = `
task:
    cmd = true
    jobs = 5
`;
        const tasks = Run.getInstance(data, ["task"], new Map<string, string>());
        assert.instanceOf(tasks, Run);
        (tasks as Run).go(4, false, done, assert.fail);
    });
    test("issue #20", (done) => {
        const data = `
first: second third
    cmd = rm mizpvbyLLW
second:
    cmd = touch mizpvbyLLW
    jobs = 2
third:
    cmd = sleep 1
    weight = 10
`;
        const tasks = Run.getInstance(data, ["first"], new Map<string, string>());
        assert.instanceOf(tasks, Run);
        (tasks as Run).go(2, false, done, assert.fail);
    });
});
