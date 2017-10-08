import { assert } from "chai";
import { buildTasks, Task } from "../lib/index";

suite("Functional", () => {
    suite("#hello()", () => {
        test("should return `Hello world!`", () => {
            const data: Array<[string, string[]]> = [];
            assert.deepEqual(buildTasks(data), []);
        });
        test("should return `Hello world!`", () => {
            const data: Array<[string, string[]]> = [["a", []]];
            assert.equal(buildTasks(data).length, 1);
        });
        test("should return `Hello world!`", () => {
            const data: Array<[string, string[]]> = [["a", []], ["b", []]];
            assert.equal(buildTasks(data).length, 2);
        });
    });
});
