import { assert } from "chai";
//import { dedent } from "dedent-js";
import { parseConfiguration } from "../lib/parser";

suite("Parser", () => {
    suite("#hello()", () => {
        test("invalid configuration return string", () => {
            assert.isTrue(parseConfiguration(`&`) instanceof Error);
        });
        test("should parse empty string", () => {
            assert.isFalse(parseConfiguration(``) instanceof Error);
        });
        test("should parse newline", () => {
            assert.isFalse(parseConfiguration(`
`) instanceof Error);
        });
        test("should parse single comment", () => {
            assert.isFalse(parseConfiguration(`; foo`) instanceof Error);
        });
        test("should parse multiple comments", () => {
            assert.isFalse(parseConfiguration(`; foo
; bar`) instanceof Error);
        });
        test("should parse single task", () => {
            assert.isFalse(parseConfiguration(`task :`) instanceof Error);
        });
        test("should parse single task with one dependency", () => {
            assert.isFalse(parseConfiguration(`task : depa`) instanceof Error);
        });
        test("should parse single task with many dependencies", () => {
            assert.isFalse(parseConfiguration(`task : depa depb depn`) instanceof Error);
        });
        test("should parse single task with one option", () => {
            assert.isFalse(parseConfiguration(`task :
    opta = vala`) instanceof Error);
        });
        test("should parse single task with two options", () => {
            assert.isFalse(parseConfiguration(`task :
    opta = vala
    optb = valb`) instanceof Error);
        });
        test("should parse complete example", () => {
            assert.isFalse(parseConfiguration(`
; comment
; comment
task1 : task2 task3
    opta = vala
    optb = valb


; comment
; comment
task2:
    opta=vala 
    optb=valb ;

task3 :
`) instanceof Error);
        });
    });
});
