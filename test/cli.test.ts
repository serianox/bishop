import { assert } from "chai";
import * as path from "path";
import { main } from "../lib/cli";

suite("Functional", () => {
    suite("#main()", () => {
        test("implicit file", (done) => {
            main("/usr/bin/node bs".split(" "), (exitCode) => { assert.equal(exitCode, 0); done(); });
        });
        test("bad file", (done) => {
            main("/usr/bin/node bs -f znRBs7DhKp".split(" "), (exitCode) => { assert.notEqual(exitCode, 0); done(); });
        });
        test(".bishop file", (done) => {
            main("/usr/bin/node bs -f .bishop".split(" "), (exitCode) => { assert.equal(exitCode, 0); done(); });
        });
        test("-S", (done) => {
            main("/usr/bin/node bs -S".split(" "), (exitCode) => { assert.equal(exitCode, 0); done(); });
        });
        test("--simulate", (done) => {
            main("/usr/bin/node bs --simulate".split(" "), (exitCode) => { assert.equal(exitCode, 0); done(); });
        });
        test("-d", (done) => {
            main("/usr/bin/node bs -d".split(" "), (exitCode) => { assert.equal(exitCode, 0); done(); });
        });
        test("--debug", (done) => {
            main("/usr/bin/node bs --debug".split(" "), (exitCode) => { assert.equal(exitCode, 0); done(); });
        });
        test("-s", (done) => {
            main("/usr/bin/node bs -s".split(" "), (exitCode) => { assert.equal(exitCode, 0); done(); });
        });
        test("--silent", (done) => {
            main("/usr/bin/node bs --silent".split(" "), (exitCode) => { assert.equal(exitCode, 0); done(); });
        });
    });
});
