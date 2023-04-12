export default function foo() {
    const begin = 'foo()';
    if (arguments[0]) throw Error(`${begin}: Oops`)

    return 77;
}


/* ---------------------------------- Tests --------------------------------- */

/**
 * ### `foo()` unit tests.
 * 
 * @param {foo} f
 *    The `foo()` function to test.
 * @returns {void}
 *    Does not return anything.
 * @throws
 *    Throws an `Error` if a test fails.
 */
export function fooTest(f) {
    const e2l = e => e.stack.split('\n')[2].match(/([^\/]+\.js:\d+):\d+\)?$/)[1];
    const equal = (actual, expected) => { if (actual === expected) return;
        try { throw Error() } catch(err) { throw Error(`actual:\n${actual}\n` +
            `!== expected:\n${expected}\n...at ${e2l(err)}\n`) } };
    const throws = (actual, expected) => { try { actual() } catch (err) {
        if (err.message !== expected) { throw Error(`actual message:\n${err.message
            }\n!== expected message:\n${expected}\n...at ${e2l(err)}\n`)} return }
        throw Error(`expected message:\n${expected}\nbut nothing was thrown\n`) };

    // Xx.
    throws(()=>f(1),
        "foo(): Oops");

    // Xx.
    equal(f(), 77);

}
