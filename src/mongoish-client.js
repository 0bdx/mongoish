import { aintaString } from '@0bdx/ainta';
import Database from './database.js';

/**
 * ### An in-memory database client, based on `picodb`.
 * 
 * As far as the basics go, `MongoishClient` behaves like `MongoClient` from the
 * NPM package `mongodb`. But instead of connecting to a MongoDB server, it uses
 * the in-memory database `picodb`.
 * 
 * Using a real MongoDB:  
 * `const client = new MongoClient("mongodb://localhost:27017");`
 *
 * Using a Mongoish:  
 * `const client = new MongoishClient("mongodb://localhost:27017");`
 */
export default class MongoishClient {
    /**
     * ### Creates an in-memory database client, based on `picodb`.
     * 
     * @param {string} url
     *    Not really used for anything. But to make the switch to a real MongoDB
     *    smoother, `new MongoishClient("INVALID URL")` will throw an `Error`.
     * @throws
     *    Throws an `Error` if the `url` argument is invalid.
     */
    constructor(url) {
        const begin = 'new MongoishClient()';

        // Validate the `url` argument.
        // @TODO improve the rx
        const aUrl = aintaString(url, 'url', { begin, min:11, max:1024,
            rx:/^mongodb:\/\/[!-\[\]-~]+$/});
        if (aUrl) throw Error(aUrl);

        // Mock a real MongoDB client, which starts life disconnected.
        this._isConnected = false;
    }

    /**
     * ### Enables the `db()` method.
     * 
     * An async method which takes no arguments, and returns a `Promise` which
     * does not resolve to anything.
     * 
     * Before it resolves, calling `db()` should fail. After it resolves, `db()`
     * should return a `db` instance.
     * 
     * @returns {Promise<void>}
     *    Returns a `Promise` which does not resolve to anything.
     */
    async connect() {

        // Make `connect()` genuinely asynchronous, to avoid surprises when
        // switching to the `mongodb` package.
        await new Promise(resolve => setImmediate(resolve));

        // Eventually set the private `_isConnected` property, so that `db()`
        // can succeed, after a delay.
        this._isConnected = true;
    }

    /**
     * ### Disables the `db()` method.
     * 
     * An async method which takes no arguments, and returns a `Promise` which
     * does not resolve to anything.
     * 
     * After it resolves, calling `db()` or using a `collection` should throw:
     * - "Client must be connected before running operations"
     *
     * @returns {Promise<void>}
     *    Returns a `Promise` which does not resolve to anything.
     */
    async close() {

        // Immediately set the private `_isConnected` property, so that `db()`
        // will fail, without delay.
        this._isConnected = false;

        // Make `close()` genuinely asynchronous, to avoid surprises when
        // switching to the `mongodb` package.
        await new Promise(resolve => setImmediate(resolve));
    }

    /**
     * ### Retrieves a `Database` instance, creating it if missing.
     * 
     * A synchronous method which takes a database name, and returns a `Database`
     * instance.
     * 
     * @param {string} dbName
     *    The name of the database to retrieve or create.
     * @returns {Database}
     *    Returns a `Database` instance.
     * @throws
     *    Throws an `Error` if the `dbName` argument is invalid, or if the
     *    client is not currently connected.
     */
    db(dbName) {
        const begin = 'db()';

        // Validate the `dbName` argument.
        // @TODO consider making dbNames less restrictive
        const aDbName = aintaString(dbName, 'dbName', { begin, min:1, max:64,
            rx:/^[a-z][_a-z0-9]*$/});
        if (aDbName) throw Error(aDbName);

        // Check that the client is currently connected.
        if (!this._isConnected) throw Error(
            begin + ': Client must be connected before running operations');

        // Return the database.
        return new Database(this, dbName);
    }
}


/* ---------------------------------- Tests --------------------------------- */

/**
 * ### `MongoishClient` unit tests.
 * 
 * @param {typeof MongoishClient} C
 *    The `MongoishClient` class to test.
 * @returns {Promise<void>}
 *    Returns a `Promise` which does not resolve to anything.
 * @throws
 *    Throws an `Error` if a test fails.
 */
export async function mongoishClientTest(C) {
    const e2l = e => (e.stack.split('\n')[2].match(/([^\/]+\.js:\d+):\d+\)?$/)||[])[1];
    const equal = (actual, expected) => { if (actual === expected) return;
        try { throw Error() } catch(err) { throw Error(`actual:\n${actual}\n` +
            `!== expected:\n${expected}\n...at ${e2l(err)}\n`) } };
    const throws = (actual, expected) => { try { actual() } catch (err) {
        if (err.message !== expected) { throw Error(`actual message:\n${err.message
            }\n!== expected message:\n${expected}\n...at ${e2l(err)}\n`)} return }
        throw Error(`expected message:\n${expected}\nbut nothing was thrown\n`) };

    // Instantiating a `MongoishClient` with an invalid `url` should fail.
    // @ts-expect-error
    throws(()=>new C(),
        "new MongoishClient(): `url` is type 'undefined' not 'string'");
    throws(()=>new C('1234567890'),
        "new MongoishClient(): `url` '1234567890' is not min 11");
    throws(()=>new C('1234567890'.repeat(102) + 'abcde'),
        "new MongoishClient(): `url` '123456789012345678901...890abcde' is not max 1024");
    throws(()=>new C('Mongodb://a'), // capital letter "M"
        "new MongoishClient(): `url` 'Mongodb://a' fails /^mongodb:\\/\\/[!-\\[\\]-~]+$/");

    // Create the first `MongoishClient` instance for testing.
    const mc_1 = new C('mongodb://1');

    // Passing an invalid `dbName` argument to `db()` should fail.
    throws(()=>mc_1.db(null),
        "db(): `dbName` is null not type 'string'");
    throws(()=>mc_1.db(''),
        "db(): `dbName` '' is not min 1");
    throws(()=>mc_1.db('a' + '12345678'.repeat(8)),
        "db(): `dbName` 'a12345678123456781234...12345678' is not max 64");
    throws(()=>mc_1.db('1_db'), // starts with a number
        "db(): `dbName` '1_db' fails /^[a-z][_a-z0-9]*$/");
    throws(()=>mc_1.db('myDb'), // capital letter "D"
        "db(): `dbName` 'myDb' fails /^[a-z][_a-z0-9]*$/");

    // Calling `db()` before `connect()` should fail.
    throws(()=>mc_1.db('db_1'),
        "db(): Client must be connected before running operations");

    // Calling `db()` after `connect()` without waiting for the `Promise` to
    // resolve should fail.
    const connectPromise_1 = mc_1.connect();
    throws(()=>mc_1.db('db_1'),
        "db(): Client must be connected before running operations");

    // Calling `db()` after calling `close()` should fail, whether or not it
    // has resolved.
    await connectPromise_1;
    const closePromise_1 = mc_1.close();
    throws(()=>mc_1.db('db_1'),
        "db(): Client must be connected before running operations");
    await closePromise_1;
    throws(()=>mc_1.db('db_1'),
        "db(): Client must be connected before running operations");

    // Create the second `MongoishClient` instance for testing.
    const mc_2 = new C('mongodb://!~aA' + '1234567890'.repeat(101)); // 1024 chars

    // `connect()` should return a `Promise` which does not resolve to anything.
    const connectPromise_2 = mc_2.connect();
    equal(connectPromise_2 instanceof Promise, true);
    const connectResult_2 = await connectPromise_2;
    equal(connectResult_2, void 0);

    // `close()` should return a `Promise` which does not resolve to anything.
    const closePromise_2 = mc_2.close();
    equal(closePromise_2 instanceof Promise, true);
    const closeResult_2 = await closePromise_2;
    equal(closeResult_2, void 0);

    // Create the third `MongoishClient` instance for testing.
    const mc_3 = new C('mongodb://localhost:27017'); // fairly standard

    // Calling `db()` after waiting for `connect()`...`close()`...`connect()`
    // should return a `Database` instance.
    await mc_3.connect();
    await mc_3.close();
    await mc_3.connect();
    const db_3 = mc_3.db('db_3');
    equal(db_3.constructor.name, 'Database');

    // Xx.
    const coll_3 = db_3.collection('coll_3');
}
