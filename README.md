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

@TODO add examples
