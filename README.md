# HoboDB: Json Storage on AWS SimpleDB

<img  src="docs/static/logo.gif" width="256px" alt="the logo (needs to be a logo, right?)"/>

Want to store JSON objects in a database on AWS but don't want to spend

#### **5B USD per year?** 🤯🫰💰

Try SimpleDB! It is great, and simple. But it does have a series of increasingly arcane and maddeningly frustrating limits, as described in one of the only existing documentation pages titled "[Limits](https://docs.aws.amazon.com/AmazonSimpleDB/latest/DeveloperGuide/concepts.html)". 

But you have JSON objects that are longer than 256 characters in stringified form. So you can't use SimpleDB, right? 

#### **With HoboDB, you can!** 🥰💖

HoboDB provides methods to allow storing arbitrary JSON objects in SimpleDB, preserving as much of the hierarchical structure as possible.

### Features

- Flattens JSON object to a series of key-value pairs 'Attributes' expected by SimpleDB
- Automatically 'explodes' long string values into multiple numbered attributes
- Follows spec for encoding [invalid characters](https://docs.aws.amazon.com/AmazonSimpleDB/latest/DeveloperGuide/InvalidCharacters.html)

### Use

#### NPM

```sh
npm install hobo-db
```

### Getting Started

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


### Contributing

Of course I'd love to receive feedback and pull requests to make this tiny library better. 💙

## Kudos

Couldn't have made as overbranded a logo as the above if it wasn't for the [Crayon](https://crayon.designstripe.com/) by [@usr-ein](https://github.com/usr-ein)