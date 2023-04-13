import { aintaObject, aintaString } from '@0bdx/ainta';
import Collection from './collection.js';

/**
 * ### An in-memory database, based on `picodb`.
 */
export default class Database {
    /**
     * ### Creates an in-memory database, based on `picodb`.
     * 
     * @param {import('./mongoish-client.js').default} client
     *    A reference to the `MongoishClient` that instantiated this `Database`.
     * @param {string} dbName
     *    The name of the database.
     * @throws
     *    Throws an `Error` if either of the arguments are invalid.
     */
    constructor(client, dbName) {
        const begin = 'new Database()';

        // Validate the arguments.
        // @TODO maybe validate fully
        const aClient = aintaObject(client, 'client', { begin, schema: {
            _Engine: { types:['function'] },
            _isConnected: { types:['boolean'] },
            close: { types:['function'] },
            connect: { types:['function'] },
            db: { types:['function'] },
            injectEngine: { types:['function'] },
        }});
        if (aClient) throw Error(aClient);
        const aDbName = aintaString(dbName, 'dbName', { begin });
        if (aDbName) throw Error(aDbName);

        // Store a reference to the parent `MongoishClient` instance.
        this._client = client;
    }

    _collections = {};

    /**
     * ### Retrieves a `Collection` instance, creating it if missing.
     * 
     * @param {string} collectionName
     *    The name of the collection to retrieve or create.
     * @returns {Collection}
     *    Returns a `Collection` instance.
     * @throws
     *    Throws an `Error` if the `collectionName` argument is invalid,
     *    or if the client is not currently connected.
     */
    collection(collectionName) {
        const begin = 'collection()';

        // Validate the `collectionName` argument.
        // @TODO consider making collectionNames less restrictive
        const aCollectionName = aintaString(collectionName, 'collectionName',
            { begin, min:1, max:64, rx:/^[a-z][_a-z0-9]*$/});
        if (aCollectionName) throw Error(aCollectionName);

        // Check that the client is currently connected.
        if (!this._client._isConnected) throw Error(
            begin + ': Client must be connected before running operations');

        // If the named collection already exists, return a reference to it.
        const existing = this._collections[collectionName];
        if (existing) return existing;

        // Otherwise, instantiate a collection with that name, record it, and
        // return a reference to it.
        const created = new Collection(this._client, collectionName);
        this._collections[collectionName] = created;
        return created;
    }

    /**
     * ### Drop the database, by removing all collections.
     * 
     * @returns {Promise<true>}
     *    Returns a `Promise` which resolves to `true`.
     */
    async dropDatabase() {
        this._collections = {};
        return true;
    }

    /**
     * ### Returns a list of all collection names.
     * 
     * Currently very different to the standard MongoDB `listCollections()`.
     * 
     * @TODO make it work more similarly to `mongodb`
     * 
     * @returns {string[]}
     *    Returns a list of collection names.
     */
    listCollections() {
        return Object.keys(this._collections);
    }

}


/* ---------------------------------- Tests --------------------------------- */

/**
 * ### `Database` unit tests.
 * 
 * @param {typeof Database} C
 *    The `Database` class to test.
 * @returns {void}
 *    Does not return anything.
 * @throws
 *    Throws an `Error` if a test fails.
 */
export function databaseTest(C) {
    const e2l = e => (e.stack.split('\n')[2].match(/([^\/]+\.js:\d+):\d+\)?$/)||[])[1];
    const equal = (actual, expected) => { if (actual === expected) return;
        try { throw Error() } catch(err) { throw Error(`actual:\n${actual}\n` +
            `!== expected:\n${expected}\n...at ${e2l(err)}\n`) } };
    const throws = (actual, expected) => { try { actual() } catch (err) {
        if (err.message !== expected) { throw Error(`actual message:\n${err.message
            }\n!== expected message:\n${expected}\n...at ${e2l(err)}\n`)} return }
        throw Error(`expected message:\n${expected}\nbut nothing was thrown\n`) };
    const toStr = value => JSON.stringify(value, null, '  ');

    // Mock an engine.
    class MockEngine { static NAME = 'MockEngine'; static VERSION = '1' }

    // Mock a `MongoishClient` instance.
    /** @type import('./mongoish-client').default */
    const mcMock = {
        _Engine: MockEngine,
        _isConnected: true,
        connect: async () => {},
        close: async () => {},
        db: dbName => new Database(this, dbName),
        injectEngine: _engine => {},
    };

    // Instantiating a `Database` with an invalid `client` should fail.
    // @ts-expect-error
    throws(()=>new C(),
    "new Database(): `client` is type 'undefined' not 'object'");
    throws(()=>new C(null, ''),
        "new Database(): `client` is null not a regular object");
    // @ts-expect-error
    throws(()=>new C({}, ''),
        "new Database(): `client._Engine` is type 'undefined', not the `options.types` 'function'");
    // @ts-expect-error
    throws(()=>new C({ _Engine:MockEngine }, ''),
        "new Database(): `client._isConnected` is type 'undefined', not the `options.types` 'boolean'");
    // @ts-expect-error
    throws(()=>new C({ ...mcMock, connect:123 }, ''),
        "new Database(): `client.connect` is type 'number', not the `options.types` 'function'");
    // @ts-expect-error
    throws(()=>new C({ ...mcMock, connect:mcMock.connect, close:false, db:mcMock.db }, ''),
        "new Database(): `client.close` is type 'boolean', not the `options.types` 'function'");
    // @ts-expect-error
    throws(()=>new C({ _Engine:MockEngine, _isConnected:false, connect:mcMock.connect, close:mcMock.close }, ''),
        "new Database(): `client.db` is type 'undefined', not the `options.types` 'function'");

    // Instantiating a `Database` with an invalid `dbName` should fail.
    // @ts-expect-error
    throws(()=>new C(mcMock),
        "new Database(): `dbName` is type 'undefined' not 'string'");
    throws(()=>new C(mcMock, null),
        "new Database(): `dbName` is null not type 'string'");


    /* ---------------------------- collection() ---------------------------- */

    // Create a `Database` instance for testing.
    const db = new C(mcMock, 'db');
    equal(db.constructor.name, 'Database');

    // Passing an invalid `collectionName` argument to `collection()` should fail.
    throws(()=>db.collection(null),
        "collection(): `collectionName` is null not type 'string'");
    throws(()=>db.collection(''),
        "collection(): `collectionName` '' is not min 1");
    throws(()=>db.collection('a' + '12345678'.repeat(8)),
        "collection(): `collectionName` 'a12345678123456781234...12345678' is not max 64");
    throws(()=>db.collection('_coll_1'), // starts with an underscore
        "collection(): `collectionName` '_coll_1' fails /^[a-z][_a-z0-9]*$/");
    throws(()=>db.collection('COLL_1'), // capital letters
        "collection(): `collectionName` 'COLL_1' fails /^[a-z][_a-z0-9]*$/");

    // Calling `collection()` when the `MongoishClient` is not connected should fail.
    mcMock._isConnected = false;
    throws(()=>db.collection('coll_1'),
        "collection(): Client must be connected before running operations");

    // Calling `collection()` when the `MongoishClient` is connected should
    // return a `Collection` instance.
    mcMock._isConnected = true;
    const coll_1 = db.collection('coll_1');
    equal(coll_1.constructor.name, 'Collection');

    // Calling `collection()` with the same `collectionName` should return the
    // same `Collection` instance.
    equal(db.collection('coll_1'), coll_1);

    // Calling `collection()` with a different `collectionName` should return
    // a different `Collection` instance.
    const coll_2 = db.collection('coll_2');
    equal(coll_1 !== coll_2, true);


    /* ---------------- listCollections() and dropDatabase() ---------------- */

    // After the tests above, there should be two collections.
    equal(toStr(db.listCollections()), toStr(['coll_1','coll_2']));

    // After calling `dropDatabase()` there should be no collections.
    db.dropDatabase();
    equal(toStr(db.listCollections()), toStr([]));

}
