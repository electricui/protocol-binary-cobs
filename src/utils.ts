export function splitBufferWithDelimiter(toSplit: Buffer, delimiter: Buffer) {
  let buf = toSplit
  let index
  let lines = []

  while ((index = buf.indexOf(delimiter)) > -1) {
    lines.push(buf.slice(0, index))
    buf = buf.slice(index + delimiter.length, buf.length)
  }

  lines.push(buf)

  return lines
}

export function splitBufferByLength(toSplit: Buffer, splitLength: number) {
  const chunks = []
  const n = toSplit.length
  let i = 0

  // if the result is only going to be one chunk, just return immediately.
  if (toSplit.length < splitLength) {
    return [toSplit]
  }

  while (i < n) {
    let end = i + splitLength
    chunks.push(toSplit.slice(i, end))
    i = end
  }

  return chunks
}
