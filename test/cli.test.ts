import { assert } from "chai";
import * as path from "path";
import { main } from "../lib/cli";

suite("Functional", () => {
    suite("#main()", () => {
        test("implicit file", () => {
            assert.equal(main("/usr/bin/node bs".split(" ")), 0);
        });
        test("bad file", () => {
            assert.notEqual(main("/usr/bin/node bs -f znRBs7DhKp".split(" ")), 0);
        });
        test(".bishop file", () => {
            assert.equal(main("/usr/bin/node bs -f .bishop".split(" ")), 0);
        });
        test("-S", () => {
            assert.equal(main("/usr/bin/node bs -S".split(" ")), 0);
        });
        test("--simulate", () => {
            assert.equal(main("/usr/bin/node bs --simulate".split(" ")), 0);
        });
        test("-s", () => {
            assert.equal(main("/usr/bin/node bs -s".split(" ")), 0);
        });
        test("--silent", () => {
            assert.equal(main("/usr/bin/node bs --silent".split(" ")), 0);
        });
        test("-d", () => {
            assert.equal(main("/usr/bin/node bs -d".split(" ")), 0);
        });
        test("--debug", () => {
            assert.equal(main("/usr/bin/node bs --debug".split(" ")), 0);
        });
    });
});
