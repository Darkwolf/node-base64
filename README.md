# Base64
## Install
`npm i --save @darkwolf/base64`
## Usage
```javascript
// ECMAScript
import Base64 from '@darkwolf/base64'
// CommonJS
const Base64 = require('@darkwolf/base64')

// Number Encoding
const integer = Number.MAX_SAFE_INTEGER // => 9007199254740991
const encodedInt = Base64.encodeInt(integer) // => 'f////////'
const decodedInt = Base64.decodeInt(encodedInt) // => 9007199254740991

const negativeInteger = -integer // => -9007199254740991
const encodedNegativeInt = Base64.encodeInt(negativeInteger) // => '-f////////'
const decodedNegativeInt = Base64.decodeInt(encodedNegativeInt) // => -9007199254740991

// BigInt Encoding
const bigInt = BigInt(Number.MAX_VALUE) // => 179769313486231570814527423731704356798070567525844996598917476803157260780028538760589558632766878171540458953514382464234321326889464182768467546703537516986049910576551282076245490090389328944075868508455133942304583236903222948165808559332123348274797826204144723168738177180919299881250404026184124858368n
const encodedBigInt = Base64.encodeBigInt(bigInt) // => 'P////////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
const decodedBigInt = Base64.decodeBigInt(encodedBigInt) // => -179769313486231570814527423731704356798070567525844996598917476803157260780028538760589558632766878171540458953514382464234321326889464182768467546703537516986049910576551282076245490090389328944075868508455133942304583236903222948165808559332123348274797826204144723168738177180919299881250404026184124858368n

const negativeBigInt = -bigInt // => -179769313486231570814527423731704356798070567525844996598917476803157260780028538760589558632766878171540458953514382464234321326889464182768467546703537516986049910576551282076245490090389328944075868508455133942304583236903222948165808559332123348274797826204144723168738177180919299881250404026184124858368n
const encodedNegativeBigInt = Base64.encodeBigInt(negativeBigInt) // => '-P////////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
const decodedNegativeBigInt = Base64.decodeBigInt(encodedNegativeBigInt) // => -179769313486231570814527423731704356798070567525844996598917476803157260780028538760589558632766878171540458953514382464234321326889464182768467546703537516986049910576551282076245490090389328944075868508455133942304583236903222948165808559332123348274797826204144723168738177180919299881250404026184124858368n

// Text Encoding
const text = 'Ave, Darkwolf!'
const encodedText = Base64.encodeText(text) // => 'QXZlLCBEYXJrd29sZiE='
const decodedText = Base64.decodeText(encodedText) // => 'Ave, Darkwolf!'

const emojis = '🐺🐺🐺'
const encodedEmojis = Base64.encodeText(emojis) // => '8J+QuvCfkLrwn5C6'
const decodedEmojis = Base64.decodeText(encodedEmojis) // => '🐺🐺🐺'

// Buffer Encoding
const buffer = Uint8Array.of(0x00, 0x02, 0x04, 0x08, 0x0f, 0x1f, 0x3f, 0x7f, 0xff) // => <Uint8Array 00 02 04 08 0f 1f 3f 7f ff>
const encodedBuffer = Base64.encode(buffer) // => <Uint8Array 41 41 49 45 43 41 38 66 50 33 2f 2f>
const decodedBuffer = Base64.decode(encodedBuffer) // => <Uint8Array 00 02 04 08 0f 1f 3f 7f ff>

const encodedBufferToString = Base64.encodeToString(buffer) // => 'AAIECA8fP3//'
const decodedBufferFromString = Base64.decodeFromString(encodedBufferToString) // => <Uint8Array 00 02 04 08 0f 1f 3f 7f ff>

// Custom Alphabet
const base64 = new Base64('+/0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz')

const encInt = base64.encodeInt(integer) // => 'Tzzzzzzzz'
const decInt = base64.decodeInt(encInt) // => 9007199254740991

const encNegativeInt = base64.encodeInt(negativeInteger) // => '-Tzzzzzzzz'
const decNegativeInt = base64.decodeInt(encNegativeInt) // => -9007199254740991

const encBigInt = base64.encodeBigInt(bigInt) // 'DzzzzzzzzU+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++'
const decBigInt = base64.decodeBigInt(encBigInt) // => 179769313486231570814527423731704356798070567525844996598917476803157260780028538760589558632766878171540458953514382464234321326889464182768467546703537516986049910576551282076245490090389328944075868508455133942304583236903222948165808559332123348274797826204144723168738177180919299881250404026184124858368n

const encNegativeBigInt = base64.encodeBigInt(negativeBigInt) // => '-DzzzzzzzzU+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++'
const decNegativeBigInt = base64.decodeBigInt(encNegativeBigInt) // => -179769313486231570814527423731704356798070567525844996598917476803157260780028538760589558632766878171540458953514382464234321326889464182768467546703537516986049910576551282076245490090389328944075868508455133942304583236903222948165808559332123348274797826204144723168738177180919299881250404026184124858368n

const encText = base64.encodeText(text) // => 'ELNZ90/2ML7fRqxgNW2='
const decText = base64.decodeText(encText) // => 'Ave, Darkwolf!'

const encEmojis = base64.encodeText(emojis) // => 'w7yEij0TY9fkbt0u'
const decEmojis = base64.decodeText(encEmojis) // => '🐺🐺🐺'

const encBuffer = base64.encode(buffer) // => <Uint8Array 2b 2b 36 32 30 2b 77 54 44 72 7a 7a>
const decBuffer = base64.decode(encBuffer) // => <Uint8Array 00 02 04 08 0f 1f 3f 7f ff>

const encBufferToString = base64.encodeToString(buffer) // => '++620+wTDrzz'
const decBufferFromString = base64.decodeFromString(encBufferToString) // => <Uint8Array 00 02 04 08 0f 1f 3f 7f ff>
```
## [API Documentation](https://github.com/Darkwolf/node-base64/blob/master/docs/API.md)
## Contact Me
#### GitHub: [@PavelWolfDark](https://github.com/PavelWolfDark)
#### Telegram: [@PavelWolfDark](https://t.me/PavelWolfDark)
#### Email: [PavelWolfDark@gmail.com](mailto:PavelWolfDark@gmail.com)
