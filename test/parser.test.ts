import test from "ava";
// import { dedent } from "dedent-js";
import { BSError } from "../lib/error";
import { parseConfiguration } from "../lib/parser";

test("invalid configuration return string", t => {
    t.true(parseConfiguration(`&`) instanceof BSError);
});
test("should parse empty string", t => {
    t.false(parseConfiguration(``) instanceof BSError);
});
test("should parse newline", t => {
    t.false(parseConfiguration(`
`) instanceof BSError);
});
test("should parse single comment", t => {
    t.false(parseConfiguration(`; foo`) instanceof BSError);
});
test("should parse multiple comments", t => {
    t.false(parseConfiguration(`; foo
; bar`) instanceof BSError);
});
test("should parse single task", t => {
    t.false(parseConfiguration(`task :`) instanceof BSError);
});
test("should parse single task with one dependency", t => {
    t.false(parseConfiguration(`task : depa`) instanceof BSError);
});
test("should parse single task with many dependencies", t => {
    t.false(parseConfiguration(`task : depa depb depn`) instanceof BSError);
});
test("should parse single task with one option", t => {
    t.false(parseConfiguration(`task :
    opta = vala`) instanceof BSError);
});
test("should parse single task with two options", t => {
    t.false(parseConfiguration(`task :
    opta = vala
    optb = valb`) instanceof BSError);
});
test("should parse an option with no value", t => {
    t.false(parseConfiguration(`task :
    opta `) instanceof BSError);
});
test("should parse complete example", t => {
    t.false(parseConfiguration(`
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
