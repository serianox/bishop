import test from "ava";
import { main } from "../lib/cli";

test("implicit file", async t => {
    const ret = await main("/usr/bin/node bs".split(" "));
    t.is(ret, 0);
});
test("bad file", async t => {
    const ret = await main("/usr/bin/node bs -f znRBs7DhKp".split(" "));
    t.not(ret, 0);
});
test(".bishop file", async t => {
    const ret = await main("/usr/bin/node bs -f .bishop".split(" "));
    t.is(ret, 0);
});
test("-S", async t => {
    const ret = await main("/usr/bin/node bs -S".split(" "));
    t.is(ret, 0);
});
test("--simulate", async t => {
    const ret = await main("/usr/bin/node bs --simulate".split(" "));
    t.is(ret, 0);
});
test("-d", async t => {
    const ret = await main("/usr/bin/node bs -d".split(" "));
    t.is(ret, 0);
});
test("--debug", async t => {
    const ret = await main("/usr/bin/node bs --debug".split(" "));
    t.is(ret, 0);
});
test("-s", async t => {
    const ret = await main("/usr/bin/node bs -s".split(" "));
    t.is(ret, 0);
});
test("--silent", async t => {
    const ret = await main("/usr/bin/node bs --silent".split(" "));
    t.is(ret, 0);
});
test("target", async t => {
    const ret = await main("/usr/bin/node bs --simulate ci".split(" "));
    t.is(ret, 0);
});
test("option", async t => {
    const ret = await main("/usr/bin/node bs --simulate tsconfig=tsconfig.json".split(" "));
    t.is(ret, 0);
});
test("unknown target", async t => {
    const ret = await main("/usr/bin/node bs foo".split(" "));
    t.not(ret, 0);
});
