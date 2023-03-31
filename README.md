# HoboDB: Json Storage on AWS SimpleDB

<img  src="docs/static/logo.gif" width="256px" alt="the logo (needs to be a logo, right?)"/>

Want to store JSON objects in a database on AWS but don't want to spend a trillion dollars per year? 🤯🫰💰

#### **It's easy with HoboDB and AWS SimpleDB!** 🥰💖

<img align="left"  src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/AWS_Simple_Icons_Database_Amazon_SimpleDB_Item.svg/512px-AWS_Simple_Icons_Database_Amazon_SimpleDB_Item.svg.png?20220723132737" width="64px" alt="the logo (needs to be a logo, right?)"/>

AWS SimpleDB is a highly available NoSQL data store service that is very affordable because it does not have continuous infrastructure costs like other AWS database services. You just pay (a tiny amount) for each query.

HoboDB (this package) is a **tiny zero-dependency Javascript library** providing mechanisms to store arbitrary JSON objects in AWS SimpleDB, preserving as much of the hierarchical structure as possible within the SimpleDB service limits. 


<details>

<summary> Detailed reasoning here</summary>

While AWS SimpleDB it is dead-simple to _maintain_, as the name implies, it is not simple to _use_. SimpleDB comes with a series of arcane and easily-exceeded limits, as described in the appropriately titled documentation page: "[Limits](https://docs.aws.amazon.com/AmazonSimpleDB/latest/DeveloperGuide/concepts.html)".

These limits mean developers need to think carefully about the textual size of the items they store in this database, so it's best suited for use cases like metadata indexing (like storing a record and pointer each time an S3 object is created). Out of the box, these limits are really strict:
- There cannot be more than 256 key/value pairs in an Item (database entry)
- The item values cannot be longer than 256 characters.
- Nested values are not supported (only an array of key / value pairs)

If you want to store arbitrary JSON objects as items in SimpleDB without losing heirarchy or searchability, you need to flatten and serialize the object to efficiently use the space and capacity available.
</details>

## Features

- Flattens JSON object to a series of key-value pairs 'Attributes' expected by SimpleDB
- Automatically 'explodes' long string values into multiple numbered attributes
- Follows spec for encoding [invalid characters](https://docs.aws.amazon.com/AmazonSimpleDB/latest/DeveloperGuide/InvalidCharacters.html)

## Install

```sh
npm install hobo-db
```

## Usage

Just import the `deserialize` and `serialize` functions into your Javascript application:

```js
import { serialize, deserialize } from "hobo-db"
```

To write a JSON object to SimpleDB as an `Item`:

```js
let serializedItemAttributes = serialize(YOUR_ITEM)

SDB.putAttributes({
    DomainName: YOUR_SDB_DOMAIN,
    ItemName: YOUR_ITEM_NAME,
    Attributes: serializedItemAttributes
  })
```

To retrieve and deserialize a JSON object from a SimpleDB `Item`:

```js
let RETRIEVED_ITEM = await SDB.getAttributes({
    ItemName: YOUR_ITEM_NAME,
    DomainName: YOUR_SDB_DOMAIN
  })
    .promise()
    .then(deserialize)
```

Usage with `SDB.select()` and `Array.map()` for an array of items returned by a query:

```js
let res = await SDB.select({
SelectExpression: `select * from \`${YOUR_SDB_DOMAIN}\``
}).promise()
  .then(data => data.map(deserialize))
```


## Contributing

Of course I would love to receive feedback and pull requests to make this tiny library better. 💙

## Kudos

Thanks to Diana Pinchuk ([@pinchukdiana](https://github.com/pinchukdiana)) for organizing the amazing Open Source Day event at [Zivver](https://github.com/zivver) which encouraged me to open-source this library.

Thanks to Samuel Prevost [@usr-ein](https://github.com/usr-ein) for the branding / project name ideas and the cool SVG animation tooling with [Crayon](https://crayon.designstripe.com/)!