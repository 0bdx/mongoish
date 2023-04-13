import PicoDB from 'picodb';
import {
    Collection,
    Database,
    MongoishClient,
} from './mongoish.js';

import { collectionTest } from './src/collection.js';
import { databaseTest } from './src/database.js';
import { mongoishClientTest } from './src/mongoish-client.js';

collectionTest(Collection, PicoDB);
databaseTest(Database);
mongoishClientTest(MongoishClient);
