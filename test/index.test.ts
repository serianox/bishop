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
            assert.instanceOf(Run.getInstance(data, ["task1"]), Run);
        });
        test(".bishop file", () => {
            assert.instanceOf(Run.getInstance(path.parse(".bishop"), ["ci"]), Run);
        });
    });
});
