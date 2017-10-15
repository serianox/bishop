import { assert } from "chai";
import { buildTasks, Task } from "../lib/index";
import { parseConfiguration } from "../lib/parser";

suite("Functional", () => {
    suite("#hello()", () => {
        test("should return `Hello world!`", () => {
            const data = parseConfiguration(`
task1: task2 task3
task2: task2
task3:
`)!;
            assert.isNotNull(buildTasks(data));
        });
    });
});
