/**
 * ### The object returned by `find()`.
 */
export type Cursor = {
    toArray: Function;
};
/**
 * ### The object returned by `find()`.
 *
 * @typedef {Object} Cursor
 * @property {function} toArray
 */
/**
 * ### An in-memory Mongo-like collection, based on `picodb`.
 */
export class Collection {
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
    constructor(client: MongoishClient, collectionName: string);
    _client: MongoishClient;
    _collectionName: string;
    _engine: any;
    /**
     * ### Inserts several documents into the collection.
     *
     * @param {object[]} documents
     *    The arrays of documents to insert into the collection.
     * @returns {Promise<{acknowledged:true,insertedCount:number,insertedIds:Object<string,string>}>}
     *    Returns a `Promise` which resolves to an array of results-objects.
     * @throws
     *    Throws an `Error` if the `documents` argument is invalid,
     *    or if the client is not currently connected.
     */
    insertMany(documents: object[]): Promise<{
        acknowledged: true;
        insertedCount: number;
        insertedIds: {
            [x: string]: string;
        };
    }>;
    /**
     * ### Inserts a single document into the collection.
     *
     * @param {object} document
     *    The document to insert into the collection.
     * @returns {Promise<{acknowledged:true,insertedId:string}>}
     *    Returns a `Promise` which resolves to a simple results-object.
     * @throws
     *    Throws an `Error` if the `document` argument is invalid,
     *    or if the client is not currently connected.
     */
    insertOne(document: object): Promise<{
        acknowledged: true;
        insertedId: string;
    }>;
    /**
     * ### Creates a cursor for a filter that can be used to find documents.
     *
     * Note that PicoDB does not implement MongoDB's `findOne()` method.
     *
     * @param {object} filter
     *    The search criteria.
     * @returns {Cursor}
     *    Returns a cursor object.
     * @throws
     *    Throws an `Error` if the `filter` argument is invalid, or if the
     *    client is not currently connected.
     */
    find(filter: object): Cursor;
}
/**
 * ### An in-memory database, based on `picodb`.
 */
export class Database {
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
    constructor(client: MongoishClient, dbName: string);
    _client: MongoishClient;
    _collections: {};
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
    collection(collectionName: string): Collection;
    /**
     * ### Drop the database, by removing all collections.
     *
     * @returns {Promise<true>}
     *    Returns a `Promise` which resolves to `true`.
     */
    dropDatabase(): Promise<true>;
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
    listCollections(): string[];
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
export class MongoishClient {
    /**
     * ### Creates an in-memory database client, based on `picodb`.
     *
     * @param {string} url
     *    Not really used for anything. But to make the switch to a real MongoDB
     *    smoother, `new MongoishClient("INVALID URL")` will throw an `Error`.
     * @throws
     *    Throws an `Error` if the `url` argument is invalid.
     */
    constructor(url: string);
    /** @type {{new():Object,NAME:string,VERSION:string}} */
    _Engine: {
        new (): any;
        NAME: string;
        VERSION: string;
    };
    _isConnected: boolean;
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
    connect(): Promise<void>;
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
    close(): Promise<void>;
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
    db(dbName: string): Database;
    /**
     * ### A `mongoish`-only method, for injecting an engine like `PicoDB`.
     *
     * @param {{new():Object,NAME:string,VERSION:string}} Engine
     *    The database engine, which must be a class. Instantiating it should
     *    return a collection object, with methods like `find()`, `insertOne()`.
     * @returns {void}
     *    Does not return anything.
     */
    injectEngine(Engine: {
        new (): any;
        NAME: string;
        VERSION: string;
    }): void;
}
