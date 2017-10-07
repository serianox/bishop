import { assert } from "chai";
import { parseConfiguration } from "../lib/parser";

suite("Parser", () => {
    suite("#hello()", () => {
        test("should parse empty string", () => {
            assert.isTrue(parseConfiguration(``));
        });
        test("should parse newline", () => {
            assert.isTrue(parseConfiguration(`
`));
        });
        test("should parse single comment", () => {
            assert.isTrue(parseConfiguration(`; foo`));
        });
        test("should parse multiple comments", () => {
            assert.isTrue(parseConfiguration(`; foo
; bar`));
        });
        test("should parse single task", () => {
            assert.isTrue(parseConfiguration(`task :`));
        });
        test("should parse single task with one dependency", () => {
            assert.isTrue(parseConfiguration(`task : depa`));
        });
        test("should parse single task with many dependencies", () => {
            assert.isTrue(parseConfiguration(`task : depa depb depn`));
        });
        test("should parse single task with one option", () => {
            assert.isTrue(parseConfiguration(`task :
    opta = vala`));
        });
        test("should parse FOO", () => {
            assert.isTrue(parseConfiguration(`    opta = vala`));
        });
        test("should parse single task with two options", () => {
            assert.isTrue(parseConfiguration(`task :
    opta = vala
    optb = valb`));
        });
        test("should parse complete example", () => {
            assert.isTrue(parseConfiguration(`
; comment
; comment
task1 : task2 task3
    opta = vala
    optb = valb


; comment
; comment
task2: ;
    opta=vala 
    optb=valb ;

task3 :
`));
        });
    });
});
