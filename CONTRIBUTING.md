# Contributing

@TODO add an overview

---

## Set up the project

### __Set up your development machine__

1.  Check your __Git__ version:  
    `git --version # should be 'git version 2.20.1' or greater`
2.  Check your __Node__ version:  
    `node --version # should be 'v16.16.0' or greater`
3.  Check your global __TypeScript__ version:  
    `tsc --version # should be 'Version 4.9.4' or greater`  
    There is no actual TypeScript code in this project, but TypeScript can infer
    types from the JavaScript code and JSDoc comments.
    - VS Code uses `tsserver` to highlight errors in __src/__ JavaScript files
    - `tsc` is needed to generate the __mongoish.d.ts__ type declaration

### __Set up VS Code__

1.  Check your __VS Code__ version:  
    `code --version # should be '1.75.1' or greater`
2.  Install and enable the [`jeremyljackson.vs-docblock`
    ](https://marketplace.visualstudio.com/items?itemName=jeremyljackson.vs-docblock)
    extension.
3.  Install and enable the [`dnamsons.kimbie-dark-plus`
    ](https://marketplace.visualstudio.com/items?itemName=dnamsons.kimbie-dark-plus)
    theme.  

### __Set up the repo locally__

Clone the repository, and `cd` into it:  
`git clone git@github.com:0bdx/mongoish.git && cd mongoish`

Install the five dev-dependencies and one dependency:  
`npm i`  
@0bdx/build-helpers 0.0.4, 1 package, 22 kB for 6 items.  
@rollup/plugin-node-resolve Xx.  
@types/node 18.13.0, 1 package, 3.6 MB for 126 items.  
picodb Xx.  
rollup 3.20.2, 2 packages, 2.6 MB for 32 items.  
@0bdx/ainta 0.0.15, 1 package, 84 kB for 7 items.  

Open the `mongoish` repo in VS Code:  
`code .`

---

## Handy dev commands

Run all tests on the in-development source code:  
`npm test`

Build __mongoish.js__ and __mongoish.d.ts__:  
`npm run build:prod`  
`npm run build:types`

Run all tests on the built __mongoish.js__ file:  
`npm run preflight:test`

Check that __mongoish.js__ uses all types correctly:  
`npm run preflight:types`

Or run all the build and preflight steps in one line, eg before committing:  
`npm run build && npm run preflight`

Display what will be published:  
`npm publish --dry-run`

Publish to [npmjs.com/package/@0bdx/mongoish](
https://www.npmjs.com/package/@0bdx/mongoish):  
`npm publish`

---

## How to create a project like this, from scratch

### __1. Create the initial repo__

1. At GitHub, click the ‘+’ icon, and ‘New repository’
2. Name it, describe it, tick ‘Add a README file’, choose MIT license
3. Click ‘Create repository’
4. Click the ‘Code’ button, ‘Local’ tab, ‘SSH’, and the copy icon
5. In your Terminal, `cd` to wherever you work
6. `git clone ` and paste: ‘git@github.com:<github-username>/<repo-name>.git’
7. `cd` into the new directory, `cd <repo-name>`

### __2. Add the .gitignore file__

```
.DS_Store
node_modules
node_modules.zip
```

### __3. Add placeholders for the type declarations and main files__

In stage 4. below, `npm init` will use the presence of these files to populate
the `"types"` and `"main"` fields of __package.json__.

```sh
touch mongoish.d.ts mongoish.js
```

### __4. Add the initial package.json file__

```sh
npm init --yes
sed -ix 's/: "1.0.0",/: "0.0.1",/' *e.json
sed -ix 's/keywords": \[/keywords": [ "db", "mongo", "picodb" /' *e.json
sed -ix 's/: "ISC",/: "MIT",/' *e.json
A=(§{1..3},\\n·);sed -ix "s/\"main/${A[*]}·\"main/;s/·/ /g" *e.json
A=(§{a..f},\\n···);sed -ix "s/\"test/${A[*]}·\"test/;s/·/ /g" *e.json
sed -ix 's/§1/"type": "module"/' *e.json
sed -ix 's|§2|"files": [ "§0d.ts", "§0js" ]|' *e.json
sed -ix 's/§3/"engines": { "node": ">= 16.16.0" }/' *e.json
sed -ix 's/§a/"§Z:§A": "rollup -c"/' *e.json
sed -ix 's/§b/"§Z:§B": "tsc §0js §_"/' *e.json
sed -ix 's/§_/--allowJs --declaration --emitDeclarationOnly/' *e.json
sed -ix 's/§c/"§Z": "for s in {§A,§B};do npm run §Z:$s;done"/' *e.json
sed -ix 's/§A/prod/g;s/§B/types/g;s/§Z/build/g;' *e.json
sed -ix 's/§d/"§Z:§D": "echo \\"🧬 test.js\\" && node test.js"/' *e.json
sed -ix 's/§e/"§Z:§E": "tsc §0js §_"/' *e.json
sed -ix 's/§_/--allowJs --checkJs --noEmit --lib es2019/' *e.json
sed -ix 's/§f/"§Z": "for s in {§D,§E};do npm run §Z:$s;done"/' *e.json
sed -ix 's/§D/test/g;s/§E/types/g;s/§Z/preflight/g;' *e.json
sed -ix 's|Error: no test specified|🧪 src/test.js|' *e.json
sed -ix 's|exit 1|node src/test.js|' *e.json
sed -ix 's/§0/mongoish./g' *e.json
sed -ix 's/author": "/author": "0bdx <0@0bdx.com> (0bdx.com)/' *e.json
rm package.jsonx
npm install @0bdx/build-helpers --save-dev
npm install @rollup/plugin-node-resolve --save-dev
npm install @types/node --save-dev
npm install picodb --save-dev
npm install rollup --save-dev
npm install @0bdx/ainta
```

1. Create a default __package.json__ file:  
   `npm init --yes`
2. Change the version to 0.0.1:  
   `sed -ix 's/: "1.0.0",/: "0.0.1",/' *e.json`
3. Add keywords, for better [npmjs.org](http://npmjs.org) searchability:  
   `sed -ix 's/keywords": \[/keywords": [ "db", "mongo", "picodb" /' *e.json`
4. Change the license to MIT:  
   `sed -ix 's/: "ISC",/: "MIT",/' *e.json`
5. Insert three top-level placeholder properties before `"main"`, and then  
   insert six placeholder `"script"` properties before `"test"`:  
   `A=(§{1..3},\\n·);sed -ix "s/\"main/${A[*]}·\"main/;s/·/ /g" *e.json`  
   `A=(§{a..f},\\n···);sed -ix "s/\"test/${A[*]}·\"test/;s/·/ /g" *e.json`
6. Tell Node to use `import` not `require()` (avoids needing .mjs):  
   `sed -ix 's/§1/"type": "module"/' *e.json`
7. Tell NPM which files to include as part of the published package:  
   `sed -ix 's|§2|"files": [ "§0d.ts", "§0js" ]|' *e.json`
8. Specify the minimum supported Node.js version:  
   `sed -ix 's/§3/"engines": { "node": ">= 16.16.0" }/' *e.json`
9. The first script generates the main file, __mongoish.js__, and then  
   the second script generates the type declarations, __mongoish.d.ts__.  
   The third script is a shortcut to run both `"build:..."` scripts:  
   `sed -ix 's/§a/"§Z:§A": "rollup -c"/' *e.json`  
   `sed -ix 's/§b/"§Z:§B": "tsc §0js §_"/' *e.json`  
   `sed -ix 's/§_/--allowJs --declaration --emitDeclarationOnly/' *e.json`  
   `sed -ix 's/§c/"§Z": "for s in {§A,§B};do npm run §Z:$s;done"/' *e.json`  
   `sed -ix 's/§A/prod/g;s/§B/types/g;s/§Z/build/g;' *e.json`  
10. The fourth script runs unit tests on the main file, __mongoish.js__,  
    and the fifth script checks it against the type declarations.  
    The sixth script is a shortcut to run both `"preflight:..."` scripts:  
    `sed -ix 's/§d/"§Z:§D": "echo \"🧬 test.js\" && "/' *e.json`  
    `sed -ix 's/§e/"§Z:§E": "tsc §0js §_"/' *e.json`  
    `sed -ix 's/§_/--allowJs --checkJs --noEmit --lib es2019/' *e.json`  
    `sed -ix 's/§f/"§Z": "for s in {§D,§E};do npm run §Z:$s;done"/' *e.json`  
    `sed -ix 's/§D/test/g;s/§E/types/g;s/§Z/preflight/g;' *e.json`  
11. The seventh script runs unit tests on the source code:  
    `sed -ix 's|Error: no test specified|🧪 src/test.js|' *e.json`  
    `sed -ix 's|exit 1|node src/test.js|' *e.json`
12. Replace `§0` with `mongoish.`:  
    `sed -ix 's/§0/mongoish./g' *e.json`
13. Insert the author’s name, email and domain:  
    `sed -ix 's/author": "/author": "0bdx <0@0bdx.com> (0bdx.com)/' *e.json`
14. Delete the temporary __package.jsonx__ file:  
    `rm package.jsonx`
15. Install five dev-dependencies:  
    `npm install @0bdx/build-helpers --save-dev`  
    `npm install @rollup/plugin-node-resolve --save-dev`  
    `npm install @types/node --save-dev`  
    `npm install picodb --save-dev`  
    `npm install rollup --save-dev`  
16. Install one dependency:  
    `npm install @0bdx/ainta`

### __5. Fix the package name__

Change the `"name"` in README.md (1 place), package-lock.json (2 places) and
package.json (1 place).  
From: `"mongoish"`  
To: `"@0bdx/mongoish"`
