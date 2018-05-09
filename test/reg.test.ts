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
    test("issue #16", (done) => {
        const data = `
task1: task2 task3
task2: task2
task3:
`;
        const tasks = Run.getInstance(data, ["task1"], new Map<string, string>());
        assert.instanceOf(tasks, Run);
        (tasks as Run).go(1, false, done, assert.fail);
    });
});
