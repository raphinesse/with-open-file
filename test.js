import test from 'ava'
import sinon from 'sinon'
import rewire from 'rewire'

const TEST_FD = 42
const TEST_RESULT = 'Callback result'
const TEST_ARGS = Object.freeze(['testPath', 'r'])

test('calls callback with temporary file descriptor', async t => {
  const m = rewire('.')
  const fsP = {
    open: sinon.stub().resolves(TEST_FD),
    close: sinon.stub().resolves(),
  }
  m.__set__({ fsP })
  const callback = sinon.stub().resolves(TEST_RESULT)

  const result = await m(...TEST_ARGS, callback)
  t.true(fsP.open.calledOnceWithExactly(...TEST_ARGS))
  t.true(callback.calledOnceWithExactly(TEST_FD))
  t.true(fsP.close.calledOnceWithExactly(TEST_FD))
  t.true(fsP.open.calledBefore(fsP.close))
  t.is(result, TEST_RESULT)
})

test('synchronously calls callback with temporary file descriptor', t => {
  const m = rewire('.')
  const fs = {
    openSync: sinon.stub().returns(TEST_FD),
    closeSync: sinon.spy(),
  }
  m.__set__({ fs })
  const callback = sinon.stub().returns(TEST_RESULT)

  const result = m.sync(...TEST_ARGS, callback)
  t.true(fs.openSync.calledOnceWithExactly(...TEST_ARGS))
  t.true(callback.calledOnceWithExactly(TEST_FD))
  t.true(fs.closeSync.calledOnceWithExactly(TEST_FD))
  t.true(fs.openSync.calledBefore(fs.closeSync))
  t.is(result, TEST_RESULT)
})
