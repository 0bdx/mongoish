import { aintaObject, aintaString } from '@0bdx/ainta';
import PicoDB from 'picodb';

/**
 * ### An in-memory Mongo-like collection, based on `picodb`.
 */
export default class Collection {
    /**
     * ### Creates an in-memory Mongo-like collection, based on `picodb`.
     * 
     * @param {import('./mongoish-client.js').default} client
     *    A reference to the `MongoishClient` that instantiated the `Database`
     *    that instantiated this `Collection`.
     * @param {string} collectionName
     *    The name of the collection.
     * @throws
     *    Throws an `Error` if the `collectionName` arguments is invalid.
     */
    constructor(client, collectionName) {
        const begin = 'new Collection()';

        // Validate the arguments.
        // @TODO maybe validate fully
        const aClient = aintaObject(client, 'client', { begin, schema: {
            _isConnected: { types:['boolean'] },
            close: { types:['function'] },
            connect: { types:['function'] },
            db: { types:['function'] },
        }});
        if (aClient) throw Error(aClient);
        const aCollectionName = aintaString(
            collectionName, 'collectionName', { begin });
        if (aCollectionName) throw Error(aCollectionName);

        // Store a reference to the grandparent `MongoishClient` instance.
        this._client = client;

        // Store the collection's name, for better error messages.
        this._collectionName = collectionName;

        // `new PicoDB()` actually creates a collection.
        this._picodb = new PicoDB();
    }

    /**
     * ### Inserts a single document into the collection.
     * 
     * @param {object} document
     *    The `Document` to insert into the collection.
     * @returns {Promise<{acknowledged:true,insertedId:string}>}
     *    Returns a `Promise` which resolves to a simple results-object.
     * @throws
     *    Throws an `Error` if the `document` argument is invalid,
     *    or if the client is not currently connected.
     */
    async insertOne(document) {
        const begin = 'insertOne()';

        // Validate the `document` argument.
        const aDocument = aintaObject(document, 'document', { begin, open:true });
        if (aDocument) throw Error(aDocument);

        // Check that the client is currently connected.
        if (!this._client._isConnected) throw Error(
            begin + ': Client must be connected before running operations');

        // If `document._id` has been set, check that it does not already exist.
        if (document._id && await this._picodb.count({ _id:document._id }))
            throw Error(`${begin}: E11000 duplicate key error collection: ` +
                `${this._collectionName}.documents index: _id_ dup key: ` + 
                `{ _id: "${document._id}" }`);

        // Pass the `insertOne()` call on to this collection's PicoDB instance.
        const result = await this._picodb.insertOne(document);

        // Return a simple results-object:
        // - `acknowledged: true` indicates that `insertOne()` succeeded
        // - `insertedId` is the unique identifier of the inserted document
        return {
            acknowledged: true,
            insertedId: result[0]._id,
        };
    }

    /**
     * ### Creates a cursor for a filter that can be used to find documents.
     * 
     * Note that PicoDB does not implement MongoDB's `findOne()` method.
     * 
     * @param {object} filter
     *    The search criteria.
     * @returns {object}
     *    Returns a cursor object.
     * @throws
     *    Throws an `Error` if the `filter` argument is invalid, or if the
     *    client is not currently connected.
     */
    find(filter) {
        const begin = 'find()';

        // Validate the `filter` argument.
        const aFilter = aintaObject(filter, 'filter', { begin, open:true });
        if (aFilter) throw Error(aFilter);

        // Check that the client is currently connected.
        if (!this._client._isConnected) throw Error(
            begin + ': Client must be connected before running operations');

        // Pass the `find()` call on to this collection's PicoDB instance.
        const result = this._picodb.find(filter);

        // @TODO maybe validate `result`?
        return result;
    }
}


/* ---------------------------------- Tests --------------------------------- */

/**
 * ### `Collection` unit tests.
 * 
 * @param {typeof Collection} C
 *    The `Collection` class to test.
 * @returns {Promise<void>}
 *    Returns a `Promise` which does not resolve to anything.
 * @throws
 *    Throws an `Error` if a test fails.
 */
export async function collectionTest(C) {
    const e2l = e => e.stack.split('\n')[2].match(/([^\/]+\.js:\d+):\d+\)?$/)[1];
    const equal = (actual, expected) => { if (actual === expected) return;
        try { throw Error() } catch(err) { throw Error(`actual:\n${actual}\n` +
            `!== expected:\n${expected}\n...at ${e2l(err)}\n`) } };
    const throws = async (actual, expected) => { try { const result = actual();
            if (result instanceof Promise) await result } catch (err) {
        if (err.message !== expected) { throw Error(`actual message:\n${err.message
            }\n!== expected message:\n${expected}\n...at ${e2l(err)}\n`)} return }
        throw Error(`expected message:\n${expected}\nbut nothing was thrown\n`) };
    const toStr = value => JSON.stringify(value, null, '  ');

    // Mock a `MongoishClient` instance.
    /** @type import('./mongoish-client').default */
    const mcMock = {
        _isConnected: true,
        connect: async () => {},
        close: async () => {},
        db: dbName => dbMock,
    };

    // Mock a `Database` instance.
    /** @type import('./database').default */
    const dbMock = {
        _client: mcMock,
        _collections: {},
        collection(cn) { return new Collection(mcMock, cn) },
        async dropDatabase() { return true },
        listCollections() { return [] },
    };

    // Instantiating a `Collection` with an invalid `client` should fail.
    // @ts-expect-error
    throws(()=>new C(),
    "new Collection(): `client` is type 'undefined' not 'object'");
    throws(()=>new C(null, ''),
        "new Collection(): `client` is null not a regular object");
    // @ts-expect-error
    throws(()=>new C({}, ''),
        "new Collection(): `client._isConnected` is type 'undefined', not the `options.types` 'boolean'");
    // @ts-expect-error
    throws(()=>new C({ _isConnected:false, close:mcMock.close, db:mcMock.db }, ''),
        "new Collection(): `client.connect` is type 'undefined', not the `options.types` 'function'");
    // @ts-expect-error
    throws(()=>new C({ ...mcMock, close:mcMock.close, connect:'nope', db:mcMock.db }, ''),
        "new Collection(): `client.connect` is type 'string', not the `options.types` 'function'");
    // @ts-expect-error
    throws(()=>new C({ ...mcMock, db:[] }, ''),
        "new Collection(): `client.db` is an array, not the `options.types` 'function'");

    // Instantiating a `Collection` with an invalid `collectionName` should fail.
    // @ts-expect-error
    throws(()=>new C(mcMock),
        "new Collection(): `collectionName` is type 'undefined' not 'string'");
    // @ts-expect-error
    throws(()=>new C(mcMock, []),
        "new Collection(): `collectionName` is an array not type 'string'");

    // Create a `Collection` instance for testing.
    const coll_1 = new C(mcMock, 'coll_1');
    equal(coll_1.constructor.name, 'Collection');


    /* ----------------------------- insertOne() ---------------------------- */

    // Passing an invalid `document` argument to `insertOne()` should fail.
    throws(()=>coll_1.insertOne(null),
        "insertOne(): `document` is null not a regular object");
    throws(()=>coll_1.insertOne(123),
        "insertOne(): `document` is type 'number' not 'object'");

    // Calling `insertOne()` when the `MongoishClient` is not connected should fail.
    mcMock._isConnected = false;
    throws(()=>coll_1.insertOne({ x:1 }),
        "insertOne(): Client must be connected before running operations");

    // Passing a valid `document` with an `_id` to `insertOne()` when the
    // `MongoishClient` is connected should succeed.
    mcMock._isConnected = true;
    const insertOneWithIdPromise = coll_1.insertOne({ _id:'abc123xyz', x:2 });
    equal(insertOneWithIdPromise instanceof Promise, true);
    const insertOneWithIdResult = await insertOneWithIdPromise;
    equal(toStr(insertOneWithIdResult), toStr({
        acknowledged: true,
        insertedId: 'abc123xyz',
    }));

    // Passing a `document` with the same `_id` to `insertOne()` should fail.
    throws(()=>coll_1.insertOne({ _id:'abc123xyz', x:3 }),
        'insertOne(): E11000 duplicate key error collection: coll_1.documents ' +
        'index: _id_ dup key: { _id: "abc123xyz" }');

    // Passing a valid `document` with no `_id` to `insertOne()` should make
    // `picodb` generate a base-36 `_id`.
    const insertOneAutoId = await coll_1.insertOne({ x:4 });
    equal(insertOneAutoId.acknowledged, true);
    equal(typeof insertOneAutoId.insertedId, 'string');
    equal(/^[0-9a-z]{1,12}$/.test(insertOneAutoId.insertedId), true);


    /* ------------------------------- find() ------------------------------- */

    // Passing an invalid `filter` argument to `find()` should fail.
    throws(()=>coll_1.find([]),
        "find(): `filter` is an array not a regular object");
    throws(()=>coll_1.find(Symbol('nope')),
        "find(): `filter` is type 'symbol' not 'object'");

    // Calling `find()` when the `MongoishClient` is not connected should fail.
    mcMock._isConnected = false;
    throws(()=>coll_1.find({ x:2 }),
        "find(): Client must be connected before running operations");

    // Passing a simple valid `filter` to `find()` when the `MongoishClient`
    // is connected should succeed.
    mcMock._isConnected = true;
    const findX2Cursor = coll_1.find({ x:2 });
    equal(typeof findX2Cursor.toArray, 'function');
    const toArrayX2Promise = findX2Cursor.toArray();
    equal(toArrayX2Promise instanceof Promise, true);
    const toArrayX2Result = await toArrayX2Promise;
    equal(toStr(toArrayX2Result), toStr([ { _id:'abc123xyz', x:2 } ]));

    // Passing an invalid `filter` to `find()` should fail.
    const findInvalidCursor = coll_1.find({ x: { $foobar:[2,3] }});
    throws(()=>findInvalidCursor.toArray(),
        'Query._isConditionTrue: the operator "$foobar" is unknown!');

}
