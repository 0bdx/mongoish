/**
 * https://www.npmjs.com/package/@0bdx/mongoish
 * @version 0.0.1
 * @license Copyright (c) 2023 0bdx <0@0bdx.com> (0bdx.com)
 * SPDX-License-Identifier: MIT
 */
function foo() {
    const begin = 'foo()';
    if (arguments[0]) throw Error(`${begin}: Oops`)

    return 77;
}

export { foo };
