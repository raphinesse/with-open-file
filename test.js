import test from 'ava'
import sinon from 'sinon'
import rewire from 'rewire'
import delay from 'delay'

const TEST_FD = 42
const TEST_RESULT = 'Callback result'
const TEST_ARGS = Object.freeze(['testPath', 'r'])
class TestError extends Error {}

test.beforeEach(t => {
  const m = rewire('.')
  const fs = {
    openSync: sinon.stub().returns(TEST_FD),
    closeSync: sinon.spy(),
  }
  const fsP = {
    open: sinon.stub().resolves(TEST_FD),
    close: sinon.stub().resolves(),
  }
  m.__set__({ fs, fsP })
  t.context = { m, fs, fsP, callback: sinon.stub() }
})

test('calls callback with temporary file descriptor', async t => {
  const { m, fsP, callback } = t.context
  callback.resolves(TEST_RESULT)

  t.is(await m(...TEST_ARGS, callback), TEST_RESULT)

  t.true(fsP.open.calledOnceWithExactly(...TEST_ARGS))
  t.true(callback.calledOnceWithExactly(TEST_FD))
  t.true(fsP.close.calledOnceWithExactly(TEST_FD))

  t.true(fsP.open.calledBefore(callback))
  t.true(fsP.close.calledAfter(callback))
})

test('calls async functions in order', async t => {
  const { m, fsP, callback } = t.context
  const onFsOpenResolve = sinon.spy()
  const onCallbackResolve = sinon.spy()
  fsP.open.callsFake(_ => delay(10).then(onFsOpenResolve))
  callback.callsFake(_ => delay(10).then(onCallbackResolve))

  await m(...TEST_ARGS, callback)

  t.true(callback.calledAfter(onFsOpenResolve))
  t.true(fsP.close.calledAfter(onCallbackResolve))
})

test('closes the file if callback rejects', async t => {
  const { m, fsP, callback } = t.context
  callback.rejects(new TestError())

  await t.throws(m(...TEST_ARGS, callback), TestError)
  t.true(fsP.close.calledOnceWithExactly(TEST_FD))
})

test('closes the file if callback throws', async t => {
  const { m, fsP, callback } = t.context
  callback.throws(new TestError())

  await t.throws(m(...TEST_ARGS, callback), TestError)
  t.true(fsP.close.calledOnceWithExactly(TEST_FD))
})

test('synchronously calls callback with temporary file descriptor', t => {
  const { m, fs, callback } = t.context
  callback.returns(TEST_RESULT)

  t.is(m.sync(...TEST_ARGS, callback), TEST_RESULT)

  t.true(fs.openSync.calledOnceWithExactly(...TEST_ARGS))
  t.true(callback.calledOnceWithExactly(TEST_FD))
  t.true(fs.closeSync.calledOnceWithExactly(TEST_FD))

  t.true(fs.openSync.calledBefore(callback))
  t.true(fs.closeSync.calledAfter(callback))
})

test('synchronously closes the file if callback throws', t => {
  const { m, fs, callback } = t.context
  callback.throws(new TestError())

  t.throws(_ => m.sync(...TEST_ARGS, callback), TestError)
  t.true(fs.closeSync.calledOnceWithExactly(TEST_FD))
})
