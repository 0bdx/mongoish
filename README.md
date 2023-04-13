# @0bdx/mongoish

__An in-memory database client, based on `picodb`.__

∅&nbsp; __Version:__ 0.0.1  
∅&nbsp; __NPM:__ <https://www.npmjs.com/package/@0bdx/mongoish>  
∅&nbsp; __Repo:__ <https://github.com/0bdx/mongoish>  
∅&nbsp; __Homepage:__ <https://0bdx.com/mongoish>

As far as the basics go, `MongoishClient` behaves like `MongoClient` from the
NPM package `mongodb`. But instead of connecting to a MongoDB server, it uses
the in-memory database `picodb`.

Using a real MongoDB:  
`const client = new MongoClient("mongodb://localhost:27017");`

Using a Mongoish:  
`const client = new MongoishClient("mongodb://localhost:27017");`

## Examples

```js
import PicoDB from 'picodb';
import { injectPicoDB } from '@0bdx/mongoish';

// Bake a MongoDB-like in-memory database into `MongoishClient`.
const MongoishClientInjected = injectPicoDB(PicoDB);

// Instantiate a client. The `url` argument is just a placeholder - but might
// become useful if you to switch between `MongoishClient` and `MongoClient`.
const mongoishClient = new MongoishClientInjected('mongodb://localhost');

// Connecting to an in-memory database is not actually necessary. But again,
// useful if you end up swapping-out `MongoishClient` for `MongoClient`.
await mongoishClient.connect();

// Create a new database and a new collection. This is identical to MongoDB.
const animalsFactsDb = mongoishClient.db('animals_facts_db');
const frogFacts = animalsFactsDb.collection('frog_facts');

// Insert some fun frog facts.
await frogFacts.insertMany([
    { _id:'0', fact:'There are over 7000 frog and toad species.' },
    { _id:'1', fact:'Some leap 20 times their body length.' },
    { _id:'2', fact:'The study of frogs is referred to as Herpetology.' },
]);

```
