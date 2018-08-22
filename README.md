# with-open-file [![Build Status](https://travis-ci.org/raphinesse/with-open-file.svg?branch=master)](https://travis-ci.org/raphinesse/with-open-file)

> Do stuff with an open file, knowing it will finally be closed

Because the built-in way requires way too much boilerplate.


## Install

```
$ npm install with-open-file
```


## Usage

```js
const fs = require('fs-extra')
const withOpenFile = require('with-open-file')

const buf = Buffer.alloc(5)

withOpenFile('foo.txt', 'r', fd => {
  return fs.read(fd, buf, 0, buf.length, 0)
})
//=> { bytesRead: 5, buffer: ... }

withOpenFile.sync('foo.txt', 'r', fd => {
  return fs.readSync(fd, buf, 0, buf.length, 0)
})
//=> 5
```


## API

### withOpenFile(...openArgs, callback)

Returns the result of calling `callback` with the requested file descriptor.

### withOpenFile.sync(...openArgs, callback)

Returns the result of calling `callback` with the requested file descriptor.

#### callback

Type: `function`


## License

MIT © Raphael von der Grün
