import { assert } from "chai";
import { buildTasks, Task } from "../lib/index";
import { parseConfiguration } from "../lib/parser";

suite("Functional", () => {
    suite("#hello()", () => {
        test("should return `Hello world!`", () => {
            const a = buildTasks("&", ["task1"]);
            assert.isNotNull(a);
        });
        test("should return `Hello world!`", () => {
            const data = `
task1: task2 task3
task2: task2
task3:
`;
            assert.isNotNull(buildTasks(data, ["task1"]));
        });
    });
});
