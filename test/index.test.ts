import { assert } from "chai";
import { BSError } from "../lib/error";
import { Run, Task } from "../lib/index";
import { parseConfiguration } from "../lib/parser";

suite("Functional", () => {
    suite("#hello()", () => {
        test("should return `Hello world!`", () => {
            assert.instanceOf(Run.getInstance("&", ["task1"]), BSError);
        });
        test("should return `Hello world!`", () => {
            const data = `
task1: task2 task3
task2: task2
task3:
`;
            assert.instanceOf(Run.getInstance(data, ["task1"]), Run);
        });
    });
});
