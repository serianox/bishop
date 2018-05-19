import { assert } from "chai";
// import { dedent } from "dedent-js";
import { BSError } from "../lib/error";
import { parseConfiguration } from "../lib/parser";

suite("Functional", () => {
    suite("#parseConfiguration()", () => {
        test("invalid configuration return string", () => {
            assert.isTrue(parseConfiguration(`&`) instanceof BSError);
        });
        test("should parse empty string", () => {
            assert.isFalse(parseConfiguration(``) instanceof BSError);
        });
        test("should parse newline", () => {
            assert.isFalse(parseConfiguration(`
`) instanceof BSError);
        });
        test("should parse single comment", () => {
            assert.isFalse(parseConfiguration(`; foo`) instanceof BSError);
        });
        test("should parse multiple comments", () => {
            assert.isFalse(parseConfiguration(`; foo
; bar`) instanceof BSError);
        });
        test("should parse single task", () => {
            assert.isFalse(parseConfiguration(`task :`) instanceof BSError);
        });
        test("should parse single task with one dependency", () => {
            assert.isFalse(parseConfiguration(`task : depa`) instanceof BSError);
        });
        test("should parse single task with many dependencies", () => {
            assert.isFalse(parseConfiguration(`task : depa depb depn`) instanceof BSError);
        });
        test("should parse single task with one option", () => {
            assert.isFalse(parseConfiguration(`task :
    opta = vala`) instanceof BSError);
        });
        test("should parse single task with two options", () => {
            assert.isFalse(parseConfiguration(`task :
    opta = vala
    optb = valb`) instanceof BSError);
        });
        test("should parse an option with no value", () => {
            assert.isFalse(parseConfiguration(`task :
    opta `) instanceof BSError);
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
`) instanceof BSError);
        });
    });
});
