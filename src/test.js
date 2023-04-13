import PicoDB from 'picodb';
import {
    Collection,
    Database,
    MongoishClient,
} from './index.js';

import { collectionTest } from './collection.js';
import { databaseTest } from './database.js';
import { mongoishClientTest } from './mongoish-client.js';

collectionTest(Collection, PicoDB);
databaseTest(Database);
mongoishClientTest(MongoishClient);
