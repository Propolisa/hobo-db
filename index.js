const MAX_CHUNK_LENGTH = 1016
let KEY_DELIMITER = "＿"
let CHUNK_PREFIX = "ː"

function chunkSubstr(str, size) {
  const numChunks = Math.ceil(str.length / size)
  const chunks = new Array(numChunks)
  for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
    chunks[i] = str.substr(o, size)
  }
  return chunks
}

function addDelimiter(a, b) {
  return a ? `${a}${KEY_DELIMITER}${b}` : b
}

function isObject(val) {
  return typeof val === "object" && !Array.isArray(val) && val !== null
}

function paths(ob = {}, head = "") {
  let res = Object.entries(ob).reduce((product, [key, value]) => {
    let fullPath = addDelimiter(head, key)
    if (isObject(value)) {
      return product.concat(paths(value, fullPath))
    } else {
      let val = JSON.stringify(value === undefined ? null : value)
      let chunks =
        val.length > MAX_CHUNK_LENGTH
          ? chunkSubstr(val, MAX_CHUNK_LENGTH)
          : null
      return chunks
        ? product.concat(
            chunks.map((chunk, i) => ({
              Name: fullPath,
              Value:
                CHUNK_PREFIX + String(i).padStart(4, "0") + CHUNK_PREFIX + chunk
            }))
          )
        : product.concat({ Name: fullPath, Value: val })
    }
  }, [])
  return res.length ? res : { Name: head, Value: "{}" }
}

export function serialize(obj) {
  let tags = undefined
  if (obj?.cw_scan_context?.Tags) {
    tags = obj?.cw_scan_context?.Tags
    delete obj.cw_scan_context.Tags
  }
  // const tags = val?.

  let res = paths(obj)
  return res
}

export function deserialize(SimpleDbItem) {
  let kvpArray = SimpleDbItem?.Attributes
  if (Array.isArray(kvpArray)) {
    let groups = Object.entries(
      kvpArray.reduce((r, a) => {
        r[a.Name] = [...(r[a.Name] || []), a]
        return r
      }, {})
    )
    let target = {}
    groups.forEach(group => {
      let key = group[0]
      let arr = group[1]
      let len = arr.length
      createNestedObject(
        target,
        key.split(KEY_DELIMITER),
        len > 1 ? deserializeMultiAttr(arr) : JSON.parse(arr[0].Value)
      )
    })
    if (target?.cw_scan_context && Tags?.length) {
      target.cw_scan_context.Tags = Tags.map(e => e.Value)
    }
    return target
  }
  return null
}

/**
 * -> Javascript: how to dynamically create nested objects using object names given by an array
 * https://stackoverflow.com/a/11433067
 */
function createNestedObject(base, names, value) {
  var lastName = arguments.length === 3 ? names.pop() : false
  for (var i = 0; i < names.length; i++) {
    base = base[names[i]] = base[names[i]] || {}
  }
  if (lastName) base = base[lastName] = value
  return base
}

function deserializeMultiAttr(attrValues) {
  let normalized = JSON.parse(
    attrValues
      .map(({ Value }) => Value.split(CHUNK_PREFIX))
      .sort((a, b) => a[1] - b[1])
      .map(e => e[2])
      .join("")
  )
  return normalized
}
