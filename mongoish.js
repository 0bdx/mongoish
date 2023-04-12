/**
 * https://www.npmjs.com/package/@0bdx/mongoish
 * @version 0.0.1
 * @license Copyright (c) 2023 0bdx <0@0bdx.com> (0bdx.com)
 * SPDX-License-Identifier: MIT
 */
import { aintaObject, aintaString } from '@0bdx/ainta';
import PicoDB from 'picodb';

/**
 * ### An in-memory Mongo-like collection, based on `picodb`.
 */
class Collection {
    /**
     * ### Creates an in-memory Mongo-like collection, based on `picodb`.
     * 
     * @param {MongoishClient} client
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

/**
 * ### An in-memory database, based on `picodb`.
 */
class Database {
    /**
     * ### Creates an in-memory database, based on `picodb`.
     * 
     * @param {MongoishClient} client
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
            _isConnected: { types:['boolean'] },
            close: { types:['function'] },
            connect: { types:['function'] },
            db: { types:['function'] },
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
class MongoishClient {
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

export { Collection, Database, MongoishClient };
