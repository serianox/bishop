import { assert } from "chai";
import { parseConfiguration } from "../lib/parser";

suite("Parser", () => {
    suite("#hello()", () => {
        test("invalid configuration return null", () => {
            assert.isNull(parseConfiguration(`&`));
        });
        test("should parse empty string", () => {
            assert.isNotNull(parseConfiguration(``));
        });
        test("should parse newline", () => {
            assert.isNotNull(parseConfiguration(`
`));
        });
        test("should parse single comment", () => {
            assert.isNotNull(parseConfiguration(`; foo`));
        });
        test("should parse multiple comments", () => {
            assert.isNotNull(parseConfiguration(`; foo
; bar`));
        });
        test("should parse single task", () => {
            assert.isNotNull(parseConfiguration(`task :`));
        });
        test("should parse single task with one dependency", () => {
            assert.isNotNull(parseConfiguration(`task : depa`));
        });
        test("should parse single task with many dependencies", () => {
            assert.isNotNull(parseConfiguration(`task : depa depb depn`));
        });
        test("should parse single task with one option", () => {
            assert.isNotNull(parseConfiguration(`task :
    opta = vala`));
        });
        test("should parse single task with two options", () => {
            assert.isNotNull(parseConfiguration(`task :
    opta = vala
    optb = valb`));
        });
        test("should parse complete example", () => {
            assert.isNotNull(parseConfiguration(`
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
`));
        });
    });
});
