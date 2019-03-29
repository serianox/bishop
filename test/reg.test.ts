import test from "ava";
import { BSError } from "../lib/error";
import { Run } from "../lib/index";

test("issue #15", async t => {
    const data = `
test: build
	cmd = cat eWshfNIQ8g && rm eWshfNIQ8g

build: transpile copy-bin

transpile:
	cmd = sleep 2 && touch eWshfNIQ8g

copy-bin:
	cmd = true
`;
    const tasks = Run.getInstance(data, ["test"], new Map<string, string>());
    t.true(tasks instanceof Run);
    await t.notThrowsAsync((tasks as Run).go(4, false));
});
test("issue #16", async t => {
    const data = `
task1: task2 task3
task2: task2
task3:
`;
    const tasks = Run.getInstance(data, ["task1"], new Map<string, string>());
    t.true(tasks instanceof BSError);
});
test("issue #18", async t => {
    const data = `
task:
    cmd = true
    jobs = 5
`;
    const tasks = Run.getInstance(data, ["task"], new Map<string, string>());
    t.true(tasks instanceof Run);
    await t.notThrowsAsync((tasks as Run).go(4, false));
});
test("issue #20", async t => {
    const data = `
first: second third
    cmd = rm mizpvbyLLW
second:
    cmd = touch mizpvbyLLW
    jobs = 2
third:
    cmd = sleep 1
    weight = 10
`;
    const tasks = Run.getInstance(data, ["first"], new Map<string, string>());
    t.true(tasks instanceof Run);
    await t.notThrowsAsync((tasks as Run).go(2, false));
});
