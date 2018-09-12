import test from 'ava'
import { read, readSync } from 'fs'
import path from 'path'
import pify from 'pify'
import m from '..'

const readP = pify(read, { multiArgs: true })

const FILE_PATH = path.join(__dirname, '../LICENSE')
const READ_LENGTH = 3
const OPEN_ARGS = Object.freeze([FILE_PATH, 'r'])
const READ_ARGS = Object.freeze([0, READ_LENGTH, 0])

test('returns valid file descriptor', async t => {
  const [bytesRead, buffer] = await m(...OPEN_ARGS, fd => {
    const buffer = Buffer.alloc(READ_LENGTH)
    return readP(fd, buffer, ...READ_ARGS)
  })
  t.is(bytesRead, READ_LENGTH)
  t.is(buffer.toString(), 'MIT')
})

test('synchronously returns valid file descriptor', t => {
  const buffer = Buffer.alloc(READ_LENGTH)
  const bytesRead = m.sync(...OPEN_ARGS, fd =>
    readSync(fd, buffer, ...READ_ARGS)
  )
  t.is(bytesRead, READ_LENGTH)
  t.is(buffer.toString(), 'MIT')
})
