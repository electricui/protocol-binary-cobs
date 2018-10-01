const debug = require('debug')('electricui-protocol-cobs')

import { splitBufferWithDelimiter, splitBufferByLength } from './utils'

export const nullByteBuffer = Buffer.alloc(1)

export function encode(buffer: Buffer): Buffer {
  const split = splitBufferWithDelimiter(buffer, nullByteBuffer)
  const output = [nullByteBuffer]

  for (let index = 0; index < split.length; index++) {
    const chunk = split[index]

    // if the chunk was just a single 0x00 byte it will be of 0 length here
    // so we push the ptr
    if (chunk.length === 0) {
      output.push(Buffer.from([0x01]))
      continue
    }

    let subChunks = splitBufferByLength(chunk, 254)

    for (let subChunk of subChunks) {
      // add the ptr
      output.push(Buffer.from([subChunk.length + 1]))
      // add the sub-chunk
      output.push(subChunk)
    }
  }

  output.push(nullByteBuffer)

  return Buffer.concat(output)
}

export function decode(buffer: Buffer): Buffer {
  const output: Array<Buffer> = []

  let index = 0

  while (index < buffer.length) {
    // read the pointer byte
    const byte = buffer[index]

    if (byte === 0x00) {
      console.error(buffer)

      throw new Error(
        "This packet contained a 0x00 byte when it shouldn't have",
      )
    }

    // copy the data
    output.push(buffer.slice(index + 1, index + byte))

    // add any zero bytes
    if (index + byte < buffer.length && byte !== 0xff) {
      output.push(nullByteBuffer)
    }

    // skip the index to the pointer
    index += byte
  }

  return Buffer.concat(output)
}
