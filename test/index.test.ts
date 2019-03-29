import test from "ava";
import * as path from "path";
import { BSError } from "../lib/error";
import { Run, Task } from "../lib/index";

test("bad string", t => {
    const tasks = Run.getInstance("&", ["task1"], new Map<string, string>());
    t.true(tasks instanceof BSError);
});
test("basic string", async t => {
    const data = `
task1: task2 task3
task2: task3
task3:
`;
    const tasks = Run.getInstance(data, ["task1"], new Map<string, string>());
    await t.notThrowsAsync((tasks as Run).go(1, false));
});
test("unresolved dependency", t => {
    const data = `
task1: task2 task3
task3:
`;
    const tasks = Run.getInstance(data, ["task1"], new Map<string, string>());
    t.true(tasks instanceof BSError);
});
test("unresolved goal", t => {
    const data = `
task1: task3
task3:
`;
    const tasks = Run.getInstance(data, ["task2"], new Map<string, string>());
    t.true(tasks instanceof BSError);
});
test("duplicated task", t => {
    const data = `
task1:
task1:
`;
    const tasks = Run.getInstance(data, ["task1"], new Map<string, string>());
    t.true(tasks instanceof BSError);
});
test(".bishop file", async t => {
    const tasks = Run.getInstance(path.parse(".bishop"), ["ci"], new Map<string, string>());
    await t.notThrowsAsync((tasks as Run).go(1, true));
});
test("simple run", async t => {
    const data = `
task1:
    cmd = true
`;
    const tasks = Run.getInstance(data, ["task1"], new Map<string, string>());
    await t.notThrowsAsync((tasks as Run).go(1, false));
});
test("allow-failure", async t => {
    const data = `
task1:
    cmd = false
    allow-failure = true
`;
    const tasks = Run.getInstance(data, ["task1"], new Map<string, string>());
    await t.notThrowsAsync((tasks as Run).go(1, false));
});
test("disallow-failure", async t => {
    const data = `
task1:
    cmd = false
    allow-failure = false
`;
    const tasks = Run.getInstance(data, ["task1"], new Map<string, string>());
    t.true(await (tasks as Run).go(1, false) instanceof BSError);
});
test("weight", async t => {
    const data = `
second:
    cmd = rm VMDg7HUWQM
    weight = -1

first:
    cmd = touch VMDg7HUWQM
    weight = 1
`;
    const tasks = Run.getInstance(data, ["second", "first"], new Map<string, string>());
    await t.notThrowsAsync((tasks as Run).go(1, false));
});
test("not enough jobs", async t => {
    const data = `
third: first second
    cmd = rm KCqTvU54zB

second:
    jobs = 2
    cmd = touch KCqTvU54zB

first:
    weight = 10
`;
    const tasks = Run.getInstance(data, ["third"], new Map<string, string>());
    await t.notThrowsAsync((tasks as Run).go(2, false));
});
test("no replacement", async t => {
    const data = `
task:
    cmd = echo foo
`;
    const tasks = Run.getInstance(data, ["task"], new Map<string, string>());
    await t.notThrowsAsync((tasks as Run).go(1, false));
});
test("no match", async t => {
    const data = `
task:
    cmd = echo "(foo)"
`;
    const tasks = Run.getInstance(data, ["task"], new Map<string, string>());
    await t.notThrowsAsync((tasks as Run).go(1, false));
});
test("command line", async t => {
    const data = `
task:
    cmd = echo "(foo)"
`;
    const tasks = Run.getInstance(data, ["task"], new Map<string, string>([["foo", "foo"]]));
    await t.notThrowsAsync((tasks as Run).go(1, false));
});
