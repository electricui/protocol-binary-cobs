import 'mocha'

import * as chai from 'chai'
import * as sinon from 'sinon'

import { Sink, Source } from '@electricui/core'

import { COBSDecoderPipeline, COBSEncoderPipeline } from '../src/pipelines'

const assert = chai.assert

class TestSink extends Sink {
  callback: (chunk: any) => void
  constructor(callback: (chunk: any) => void) {
    super()
    this.callback = callback
  }

  async receive(chunk: any) {
    return this.callback(chunk)
  }
}

function generateTransformTest(testCase: Buffer) {
  return () => {
    const spy = sinon.spy()

    const source = new Source()
    const encoder = new COBSEncoderPipeline()
    const decoder = new COBSDecoderPipeline()
    const sink = new TestSink(spy)

    source
      .pipe(encoder)
      .pipe(decoder)
      .pipe(sink)

    source.push(testCase)

    assert.deepEqual(spy.getCall(0).args[0], testCase)
  }
}

describe('COBS Transforms', () => {
  it(
    'correctly encodes and decodes a single 0x00',
    generateTransformTest(Buffer.from([0x00])),
  )
  it(
    'correctly encodes and decodes two 0x00s',
    generateTransformTest(Buffer.from([0x00, 0x00])),
  )
  it(
    'correctly encodes and decodes 0x11 22 00 33',
    generateTransformTest(Buffer.from([0x11, 0x22, 0x00, 0x33])),
  )
  it(
    'correctly encodes and decodes 0x11 22 33 44',
    generateTransformTest(Buffer.from([0x11, 0x22, 0x33, 0x44])),
  )

  it(
    'correctly encodes and decodes a large Buffer (> 255 bytes)',
    generateTransformTest(Buffer.from(Array(257).join('ee'), 'hex')),
  )
})
