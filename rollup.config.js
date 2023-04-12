import { readFileSync } from 'fs';
import { execSync } from 'child_process';
import * as bh from '@0bdx/build-helpers';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
    ...bh.rollupConfigBasicLib(
        'mongoish.js',
        bh.generateBanner(
            new Date(),
            readFileSync('./package.json', 'utf-8'),
            bh.getFirstCommitYear(execSync),
            true,
        ),
    ),
    external: [
        '@0bdx/ainta',
    ],
    plugins: [ nodeResolve(), fixJSDoc() ],
}

// Fixes typings issues.
//
// @TODO use it or lose it
function fixJSDoc() {
    return {
        name: 'fix-js-doc',
        transform(source, id) {
            if (id.slice(-3) !== '.js') return null; // only transform JavaScript
            return source;
        }
    }
}
