import { serialize, deserialize } from "../index.js"
import SimpleDB from "aws-sdk/clients/simpledb.js"
import ORIGINAL_ITEM from "./data/entry.json" assert { type: "json" }

const SDB_DOMAIN = "simpledb-json-test-db"
const TEST_ENTRY_NAME = "TEST_ENTRY"

/** Submits an arbitrary JSON object to SimpleDB as Item Attributes.
 * It then retrieves the same Item from the database by name, and
 * reconstructs the JSON object from Attributes. If this object is
 * semantically the same as the original, the test passes.
 * Otherwise, something went wrong with the serialization.
 */
async function main() {
  let SDB = new SimpleDB({ region: process.env.AWS_REGION })

  await SDB.deleteAttributes({
    DomainName: SDB_DOMAIN,
    ItemName: TEST_ENTRY_NAME
  })
    .promise()
    .then(e =>
      console.log(
        `Deleted any existing attributes for this test Item from SimpleDB.`
      )
    )

  let serializedItemAttributes = serialize(ORIGINAL_ITEM)

  await SDB.putAttributes({
    DomainName: SDB_DOMAIN,
    ItemName: TEST_ENTRY_NAME,
    Attributes: serializedItemAttributes
  })
    .promise()
    .then(e =>
      console.log(
        `Patching serialized attributes into the test Item in SimpleDB.`
      )
    )
    .catch(e => {
      console.error(e)
    })

  /*
   * Usage with SDB.select() (list of items returned):
   *
   * let res = await SDB.select({
   * SelectExpression: `select * from \`${SDB_DOMAIN}\``
   * }).promise()
   *   .then(data => data.map(deserialize))
   * console.log((res?.Items || []).map(deserialize))
   *
   */

  let RETRIEVED_ITEM = await SDB.getAttributes({
    ItemName: TEST_ENTRY_NAME,
    DomainName: SDB_DOMAIN
  })
    .promise()
    .then(deserialize)

  //   let diff = findFirstDiffPos(IN_JSON_STRING, OUT_JSON_STRING)
  if (isEqual(ORIGINAL_ITEM, RETRIEVED_ITEM)) {
    console.log(
      "SUCCESS: Deserialized object is semantically identical to the original!"
    )
  } else {
    console.warn(
      "FAIL: Deserialized object was semantically different from original!"
    )
  }
}

main()

/**
 * HELPER FUNCTIONS
 */

/** Check if two objects are semantically equal.
 * NOTE: This does not guarantee that object properties are in the same order.
 * Array elements, however, are required to have the same order.
 *  Code from Praveen Poonia at https://stackoverflow.com/a/52645018 */
function isEqual(a, b) {
  if (a === b) return true
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime()
  if (!a || !b || (typeof a !== "object" && typeof b !== "object"))
    return a === b
  if (a === null || a === undefined || b === null || b === undefined)
    return false
  if (a.prototype !== b.prototype) return false
  let keys = Object.keys(a)
  if (keys.length !== Object.keys(b).length) return false
  return keys.every(k => isEqual(a[k], b[k]))
}

/** In case you want to recreate an SDB domain for testing (cleans all items)
 * 🚨 WARNING!! THIS WILL HAPPILY DESTROY YOUR EXISTING DATABASE IF SPECIFIED -- */
async function recreateSdbDomain(SDB, DomainName) {
  try {
    let deleted = await SDB.deleteDomain({ DomainName })
      .promise()
      .catch(e => console.error(e))
  } catch (error) {
    console.error(error)
  }
  console.log("Deleted!")
  return await SDB.createDomain({ DomainName }).promise()
}
