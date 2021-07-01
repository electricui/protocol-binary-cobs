import { DuplexPipeline, Pipeline } from '@electricui/core'
import { decode, encode, nullByteBuffer } from './cobs'
import { CancellationToken } from '@electricui/async-utilities'

import debug from 'debug'

const dPipelines = debug('electricui-protocol-binary-cobs:pipelines')

export class COBSEncoderPipeline extends Pipeline {
  receive(packet: Buffer, cancellationToken: CancellationToken) {
    return this.push(encode(packet), cancellationToken)
  }
}

export class COBSDecoderPipeline extends Pipeline {
  buffer = Buffer.alloc(0)

  async receive(packet: Buffer, cancellationToken: CancellationToken) {
    const promises: Array<Promise<any>> = []

    dPipelines(`Received data to cobs decode`, packet)

    let data = Buffer.concat([this.buffer, packet])
    let position

    while ((position = data.indexOf(nullByteBuffer)) !== -1) {
      const framed = data.slice(0, position)

      if (framed.length > 0) {
        dPipelines(`...Found a delimiter, pushing a chunk up to the binary decoder`)

        const decoded = decode(framed)
        if (decoded.length > 0) {
          promises.push(this.push(decoded, cancellationToken))
        }
      }
      data = data.slice(position + 1)
    }

    this.buffer = data
    dPipelines(`buffer leftover: `, this.buffer)

    await Promise.all(promises)
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
