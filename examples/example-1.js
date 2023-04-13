import PicoDB from 'picodb';
import { MongoishClient } from '../mongoish.js';

example1();
async function example1() {

    // Instantiate a client. The `url` argument is just a placeholder - but may
    // be useful if you to switch between `MongoishClient` and `MongoClient`.
    const mongoishClient = new MongoishClient('mongodb://localhost');

    // Inject a MongoDB-like in-memory database into `MongoishClient`.
    mongoishClient.injectEngine(PicoDB);

    // Connecting to an in-memory database is not actually necessary. But again,
    // useful if you end up swapping-out `MongoishClient` for `MongoClient`.
    await mongoishClient.connect();

    // Create a new database and a new collection.
    // Everything from this point onwards is identical to MongoDB.
    const animalsFactsDb = mongoishClient.db('animals_facts_db');
    const frogFacts = animalsFactsDb.collection('frog_facts');

    // Insert some fun frog facts.
    await frogFacts.insertMany([
        { _id:'0', fact:'There are over 7000 frog and toad species.' },
        { _id:'1', fact:'Some leap 20 times their body length.' },
        { _id:'2', fact:'The study of frogs is called Herpetology.' },
    ]);

    // Log the two documents whose `fact` begins with the letter "T".
    // [ { _id:'0', fact:'There are over 7000 frog and toad species.' },
    //   { _id:'2', fact:'The study of frogs is called Herpetology.' } ]
    console.log(
        await frogFacts.find({ fact:{ $gte:'T', $lt:'U' } }).toArray());
}
