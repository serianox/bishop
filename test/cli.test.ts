import { assert } from "chai";
import * as path from "path";
import { main } from "../lib/cli";

suite("Functional", () => {
    suite("#main()", () => {
        test("bad file", () => {
            assert.notEqual(main("/usr/bin/node bs -f foo".split(" ")), 0);
        });
        test("implicit file", () => {
            assert.equal(main("/usr/bin/node bs".split(" ")), 0);
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
        test("-d", () => {
            assert.equal(main("/usr/bin/node bs -d".split(" ")), 0);
        });
        test("--debug", () => {
            assert.equal(main("/usr/bin/node bs --debug".split(" ")), 0);
        });
    });
});
