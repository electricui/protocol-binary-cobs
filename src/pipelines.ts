import { DuplexPipeline, Pipeline } from '@electricui/core'

import { decode, encode, nullByteBuffer } from './cobs'

export class COBSEncoderPipeline extends Pipeline {
  receive(packet: Buffer) {
    return this.push(encode(packet))
  }
}

export class COBSDecoderPipeline extends Pipeline {
  buffer = Buffer.alloc(0)

  receive(packet: Buffer) {
    const promises: Array<Promise<any>> = []

    let data = Buffer.concat([this.buffer, packet])
    let position

    while ((position = data.indexOf(nullByteBuffer)) !== -1) {
      const framed = data.slice(0, position)

      if (framed.length > 0) {
        promises.push(this.push(decode(framed)))
      }

      data = data.slice(position + 1)
    }
    this.buffer = data

    return Promise.all(promises)
  }
}

/**
 * The codec duplex pipeline
 */
export default class COBSPipeline extends DuplexPipeline {
  readPipeline: COBSDecoderPipeline
  writePipeline: COBSEncoderPipeline

  constructor() {
    super()
    this.readPipeline = new COBSDecoderPipeline()
    this.writePipeline = new COBSEncoderPipeline()
  }
}
