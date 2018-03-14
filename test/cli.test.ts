import * as path from "path";
import { assert } from "chai";
import { main } from "../lib/cli";

suite("Functional", () => {
    suite("#main()", () => {
        test("bad file", () => {
            assert.equal(main("/usr/bin/node bs -f foo foo".split(" ")), 0);
        });
        test("implicit file", () => {
            assert.equal(main("/usr/bin/node bs foo".split(" ")), 0);
        });
        test(".bishop file", () => {
            assert.equal(main("/usr/bin/node bs -f .bishop foo".split(" ")), 0);
        });
        test("-d", () => {
            assert.equal(main("/usr/bin/node bs -d".split(" ")), 0);
        });
        test("--debug", () => {
            assert.equal(main("/usr/bin/node bs --debug".split(" ")), 0);
        });
    });
});
