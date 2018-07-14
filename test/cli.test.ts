import test from "ava";
import { main } from "../lib/cli";

test("implicit file", async t => {
    await t.notThrows(main("/usr/bin/node bs".split(" ")));
});
test("bad file", async t => {
    await t.throws(main("/usr/bin/node bs -f znRBs7DhKp".split(" ")));
});
test(".bishop file", async t => {
    await t.notThrows(main("/usr/bin/node bs -f .bishop".split(" ")));
});
test("-S", async t => {
    await t.notThrows(main("/usr/bin/node bs -S".split(" ")));
});
test("--simulate", async t => {
    await t.notThrows(main("/usr/bin/node bs --simulate".split(" ")));
});
test("-d", async t => {
    await t.notThrows(main("/usr/bin/node bs -d".split(" ")));
});
test("--debug", async t => {
    await t.notThrows(main("/usr/bin/node bs --debug".split(" ")));
});
test("-s", async t => {
    await t.notThrows(main("/usr/bin/node bs -s".split(" ")));
});
test("--silent", async t => {
    await t.notThrows(main("/usr/bin/node bs --silent".split(" ")));
});
