import { TextEncoder, TextDecoder } from 'util'
import {
  ObjectCreate,
  ObjectDefineProperties,
  FunctionPrototypeBind,
  FunctionPrototypeSymbolHasInstance,
  Symbol,
  SymbolToStringTag,
  RangeError,
  SyntaxError,
  TypeError,
  NumberMAX_SAFE_INTEGER,
  NumberMIN_SAFE_INTEGER,
  NumberPrototypeToString,
  BigInt,
  MathFloor,
  MathMax,
  MathMin,
  String,
  StringPrototypeCharCodeAt,
  StringPrototypeRepeat,
  Uint8Array,
  PrimitivesIsString,
  InstancesIsUint8Array,
  TypesToIntegerOrInfinity,
  TypesToBigInt,
  TypesToLength
} from '@darkwolf/primordials'

const textEncoder = new TextEncoder()
const stringToUint8Array = FunctionPrototypeBind(TextEncoder.prototype.encode, textEncoder)

const textDecoder = new TextDecoder()
const uint8ArrayToString = FunctionPrototypeBind(TextDecoder.prototype.decode, textDecoder)

const alphabetSymbol = Symbol('alphabet')
const alphabetLookupSymbol = Symbol('alphabetLookup')
const baseMapSymbol = Symbol('baseMap')
const baseMapLookupSymbol = Symbol('baseMapLookup')
const encodeToStringSymbol = Symbol('encodeToString')
const decodeFromStringSymbol = Symbol('decodeFromString')

const BASE = 64

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

const BITS_PER_CHAR = 6

const PADDING_CHAR = '='
const NEGATIVE_CHAR = '-'

const createAlphabetLookups = alphabet => {
  const lookup = ObjectCreate(null)
  const baseMap = new Uint8Array(BASE)
  const baseMapLookup = ObjectCreate(null)
  for (let i = 0; i < BASE; i++) {
    const char = alphabet[i]
    const charCode = StringPrototypeCharCodeAt(char)
    lookup[char] = i
    baseMap[i] = charCode
    baseMapLookup[charCode] = i
  }
  return {
    lookup,
    baseMap,
    baseMapLookup
  }
}

const isAlphabet = value => {
  if (!PrimitivesIsString(value) || value.length !== BASE) {
    return false
  }
  const alphabetLookup = base64[alphabetLookupSymbol]
  const uniqueCharsLookup = ObjectCreate(null)
  for (let i = 0; i < BASE; i++) {
    const char = value[i]
    if (alphabetLookup[char] === undefined || uniqueCharsLookup[char] !== undefined) {
      return false
    }
    uniqueCharsLookup[char] = i
  }
  return true
}

const toAlphabet = value => {
  if (value === undefined) {
    return ALPHABET
  }
  if (!PrimitivesIsString(value)) {
    throw new TypeError('The alphabet must be a string')
  }
  if (value.length !== BASE) {
    throw new RangeError('The length of the alphabet must be equal to 64')
  }
  const alphabetLookup = base64[alphabetLookupSymbol]
  const uniqueCharsLookup = ObjectCreate(null)
  for (let i = 0; i < BASE; i++) {
    const char = value[i]
    if (alphabetLookup[char] === undefined) {
      throw new SyntaxError(`Invalid character "${char}" at index ${i} for the Base64 alphabet`)
    }
    if (uniqueCharsLookup[char] !== undefined) {
      throw new SyntaxError(`The character "${char}" at index ${i} is already in the alphabet`)
    }
    uniqueCharsLookup[char] = i
  }
  return value
}

const isBase64String = value => {
  if (!PrimitivesIsString(value)) {
    return false
  }
  const {length} = value
  if (length % 4 !== 0) {
    return false
  }
  const alphabetLookup = base64[alphabetLookupSymbol]
  const lastIndex = length - 1
  let paddingCount = 0
  while (paddingCount < length && paddingCount < 2 && value[lastIndex - paddingCount] === PADDING_CHAR) {
    paddingCount++
  }
  const validLength = length - paddingCount
  for (let i = 0; i < validLength; i++) {
    const char = value[i]
    if (alphabetLookup[char] === undefined) {
      return false
    }
  }
  return true
}

class Base64 {
  constructor(alphabet) {
    alphabet = toAlphabet(alphabet)
    const lookups = createAlphabetLookups(alphabet)
    this[alphabetSymbol] = alphabet
    this[alphabetLookupSymbol] = lookups.lookup
    this[baseMapSymbol] = lookups.baseMap
    this[baseMapLookupSymbol] = lookups.baseMapLookup
  }

  get alphabet() {
    return this[alphabetSymbol]
  }

  encodeInt(value) {
    let number = TypesToIntegerOrInfinity(value)
    if (number < NumberMIN_SAFE_INTEGER) {
      throw new RangeError('The value must be greater than or equal to the minimum safe integer')
    } else if (number > NumberMAX_SAFE_INTEGER) {
      throw new RangeError('The value must be less than or equal to the maximum safe integer')
    }
    const alphabet = this[alphabetSymbol]
    if (!number) {
      return alphabet[0]
    }
    const isNegative = number < 0
    if (isNegative) {
      number = -number
    }
    let result = ''
    while (number) {
      result = `${alphabet[number % BASE]}${result}`
      number = MathFloor(number / BASE)
    }
    return isNegative ? `${NEGATIVE_CHAR}${result}` : result
  }

  decodeInt(string) {
    string = String(string)
    const alphabetLookup = this[alphabetLookupSymbol]
    const {length} = string
    const isNegative = string[0] === NEGATIVE_CHAR
    let result = 0
    for (let i = isNegative && length > 1 ? 1 : 0; i < length; i++) {
      const char = string[i]
      const index = alphabetLookup[char]
      if (index === undefined) {
        throw new SyntaxError(`Invalid character "${char}" at index ${i} for Base64 encoding`)
      }
      result = result * BASE + index
    }
    return isNegative && result > 0 ? -result : result
  }

  encodeBigInt(value) {
    let bigInt = TypesToBigInt(value)
    const alphabet = this[alphabetSymbol]
    if (!bigInt) {
      return alphabet[0]
    }
    const isNegative = bigInt < 0n
    if (isNegative) {
      bigInt = -bigInt
    }
    let result = ''
    while (bigInt) {
      result = `${alphabet[bigInt % 64n]}${result}`
      bigInt /= 64n
    }
    return isNegative ? `${NEGATIVE_CHAR}${result}` : result
  }

  decodeBigInt(string) {
    string = String(string)
    const alphabetLookup = this[alphabetLookupSymbol]
    const {length} = string
    const isNegative = string[0] === NEGATIVE_CHAR
    let result = 0n
    for (let i = isNegative && length > 1 ? 1 : 0; i < length; i++) {
      const char = string[i]
      const index = alphabetLookup[char]
      if (index === undefined) {
        throw new SyntaxError(`Invalid character "${char}" at index ${i} for Base64 encoding`)
      }
      result = result * 64n + BigInt(index)
    }
    return isNegative ? -result : result
  }

  [encodeToStringSymbol](input, start, end) {
    const alphabet = this[alphabetSymbol]
    const length = TypesToLength(input.length)
    let startIndex = 0
    let endIndex = length
    if (start !== undefined) {
      start = TypesToIntegerOrInfinity(start)
      startIndex = start < 0 ? MathMax(0, length + start) : MathMin(start, length)
    }
    if (end !== undefined) {
      end = TypesToIntegerOrInfinity(end)
      endIndex = end < 0 ? MathMax(0, length + end) : MathMin(end, length)
    }
    const newLength = MathMax(0, endIndex - startIndex)
    const extraBytes = newLength % 3
    const extraLength = endIndex - extraBytes
    let result = ''
    let index = startIndex
    while (index < extraLength) {
      const number = (input[index++] << 16) + (input[index++] << 8) + input[index++]
      result += alphabet[number >> 18 & 0x3f]
      result += alphabet[number >> 12 & 0x3f]
      result += alphabet[number >> 6 & 0x3f]
      result += alphabet[number & 0x3f]
    }
    if (extraBytes) {
      if (extraBytes === 1) {
        const number = input[index]
        result += alphabet[number >> 2]
        result += alphabet[number << 4 & 0x3f]
      } else if (extraBytes === 2) {
        const number = (input[index++] << 8) + input[index]
        result += alphabet[number >> 10]
        result += alphabet[number >> 4 & 0x3f]
        result += alphabet[number << 2 & 0x3f]
      }
      result += StringPrototypeRepeat(PADDING_CHAR, 3 - extraBytes)
    }
    return result
  }

  [decodeFromStringSymbol](string, start, end) {
    const alphabetLookup = this[alphabetLookupSymbol]
    const {length} = string
    let startIndex = 0
    let endIndex = length
    if (start !== undefined) {
      start = TypesToIntegerOrInfinity(start)
      startIndex = start < 0 ? MathMax(0, length + start) : MathMin(start, length)
    }
    if (end !== undefined) {
      end = TypesToIntegerOrInfinity(end)
      endIndex = end < 0 ? MathMax(0, length + end) : MathMin(end, length)
    }
    const newLength = MathMax(0, endIndex - startIndex)
    let paddingCount = 0
    if (newLength % 4 === 0) {
      const lastIndex = endIndex - 1
      while (paddingCount < newLength && paddingCount < 2 && string[lastIndex - paddingCount] === PADDING_CHAR) {
        paddingCount++
      }
    }
    const validLength = newLength - paddingCount
    const extraBytes = validLength % 4
    const extraLength = startIndex + validLength - extraBytes
    const result = new Uint8Array(validLength * 3 >> 2)
    let index = startIndex
    let resultIndex = 0
    while (index < extraLength) {
      const char = string[index]
      const charIndex = alphabetLookup[char]
      if (charIndex === undefined) {
        throw new SyntaxError(`Invalid character "${char}" at index ${index} for Base64 encoding`)
      }
      index++
      const char2 = string[index]
      const charIndex2 = alphabetLookup[char2]
      if (charIndex2 === undefined) {
        throw new SyntaxError(`Invalid character "${char2}" at index ${index} for Base64 encoding`)
      }
      index++
      const char3 = string[index]
      const charIndex3 = alphabetLookup[char3]
      if (charIndex3 === undefined) {
        throw new SyntaxError(`Invalid character "${char3}" at index ${index} for Base64 encoding`)
      }
      index++
      const char4 = string[index]
      const charIndex4 = alphabetLookup[char4]
      if (charIndex4 === undefined) {
        throw new SyntaxError(`Invalid character "${char4}" at index ${index} for Base64 encoding`)
      }
      index++
      const number = (charIndex << 18) + (charIndex2 << 12) + (charIndex3 << 6) + charIndex4
      result[resultIndex++] = number >> 16 & 0xff
      result[resultIndex++] = number >> 8 & 0xff
      result[resultIndex++] = number & 0xff
    }
    if (extraBytes === 1) {
      const char = string[index]
      const charIndex = alphabetLookup[char]
      if (charIndex === undefined) {
        throw new SyntaxError(`Invalid character "${char}" at index ${index} for Base64 encoding`)
      }
    } else if (extraBytes === 2) {
      const char = string[index]
      const charIndex = alphabetLookup[char]
      if (charIndex === undefined) {
        throw new SyntaxError(`Invalid character "${char}" at index ${index} for Base64 encoding`)
      }
      index++
      const char2 = string[index]
      const charIndex2 = alphabetLookup[char2]
      if (charIndex2 === undefined) {
        throw new SyntaxError(`Invalid character "${char2}" at index ${index} for Base64 encoding`)
      }
      const number = (charIndex << 2) + (charIndex2 >> 4)
      result[resultIndex] = number & 0xff
    } else if (extraBytes === 3) {
      const char = string[index]
      const charIndex = alphabetLookup[char]
      if (charIndex === undefined) {
        throw new SyntaxError(`Invalid character "${char}" at index ${index} for Base64 encoding`)
      }
      index++
      const char2 = string[index]
      const charIndex2 = alphabetLookup[char2]
      if (charIndex2 === undefined) {
        throw new SyntaxError(`Invalid character "${char2}" at index ${index} for Base64 encoding`)
      }
      index++
      const char3 = string[index]
      const charIndex3 = alphabetLookup[char3]
      if (charIndex3 === undefined) {
        throw new SyntaxError(`Invalid character "${char3}" at index ${index} for Base64 encoding`)
      }
      const number = (charIndex << 10) + (charIndex2 << 4) + (charIndex3 >> 2)
      result[resultIndex++] = number >> 8 & 0xff
      result[resultIndex] = number & 0xff
    }
    return result
  }

  encodeText(string, start, end) {
    return this[encodeToStringSymbol](stringToUint8Array(String(string)), start, end)
  }

  decodeText(string, start, end) {
    return uint8ArrayToString(this[decodeFromStringSymbol](String(string), start, end))
  }

  encode(input, start, end) {
    if (!InstancesIsUint8Array(input)) {
      throw new TypeError('The input must be an instance of Uint8Array')
    }
    const baseMap = this[baseMapSymbol]
    const length = TypesToLength(input.length)
    let startIndex = 0
    let endIndex = length
    if (start !== undefined) {
      start = TypesToIntegerOrInfinity(start)
      startIndex = start < 0 ? MathMax(0, length + start) : MathMin(start, length)
    }
    if (end !== undefined) {
      end = TypesToIntegerOrInfinity(end)
      endIndex = end < 0 ? MathMax(0, length + end) : MathMin(end, length)
    }
    const newLength = MathMax(0, endIndex - startIndex)
    const extraBytes = newLength % 3
    const extraLength = endIndex - extraBytes
    const result = new Uint8Array((newLength << 2 | 2) / 3)
    let index = startIndex
    let resultIndex = 0
    while (index < extraLength) {
      const number = (input[index++] << 16) + (input[index++] << 8) + input[index++]
      result[resultIndex++] = baseMap[number >> 18 & 0x3f]
      result[resultIndex++] = baseMap[number >> 12 & 0x3f]
      result[resultIndex++] = baseMap[number >> 6 & 0x3f]
      result[resultIndex++] = baseMap[number & 0x3f]
    }
    if (extraBytes === 1) {
      const number = input[index]
      result[resultIndex++] = baseMap[number >> 2]
      result[resultIndex] = baseMap[number << 4 & 0x3f]
    } else if (extraBytes === 2) {
      const number = (input[index++] << 8) + input[index]
      result[resultIndex++] = baseMap[number >> 10]
      result[resultIndex++] = baseMap[number >> 4 & 0x3f]
      result[resultIndex] = baseMap[number << 2 & 0x3f]
    }
    return result
  }

  decode(input, start, end) {
    if (!InstancesIsUint8Array(input)) {
      throw new TypeError('The input must be an instance of Uint8Array')
    }
    const baseMapLookup = this[baseMapLookupSymbol]
    const length = TypesToLength(input.length)
    let startIndex = 0
    let endIndex = length
    if (start !== undefined) {
      start = TypesToIntegerOrInfinity(start)
      startIndex = start < 0 ? MathMax(0, length + start) : MathMin(start, length)
    }
    if (end !== undefined) {
      end = TypesToIntegerOrInfinity(end)
      endIndex = end < 0 ? MathMax(0, length + end) : MathMin(end, length)
    }
    const newLength = MathMax(0, endIndex - startIndex)
    const extraBytes = newLength % 4
    const extraLength = endIndex - extraBytes
    const result = new Uint8Array(newLength * 3 >> 2)
    let index = startIndex
    let resultIndex = 0
    while (index < extraLength) {
      const charCode = input[index]
      const charIndex = baseMapLookup[charCode]
      if (charIndex === undefined) {
        throw new SyntaxError(`Invalid byte "${NumberPrototypeToString(charCode, 16)}" at index ${index} for Base64 encoding`)
      }
      index++
      const charCode2 = input[index]
      const charIndex2 = baseMapLookup[charCode2]
      if (charIndex2 === undefined) {
        throw new SyntaxError(`Invalid byte "${NumberPrototypeToString(charCode2, 16)}" at index ${index} for Base64 encoding`)
      }
      index++
      const charCode3 = input[index]
      const charIndex3 = baseMapLookup[charCode3]
      if (charIndex3 === undefined) {
        throw new SyntaxError(`Invalid byte "${NumberPrototypeToString(charCode3, 16)}" at index ${index} for Base64 encoding`)
      }
      index++
      const charCode4 = input[index]
      const charIndex4 = baseMapLookup[charCode4]
      if (charIndex4 === undefined) {
        throw new SyntaxError(`Invalid byte "${NumberPrototypeToString(charCode4, 16)}" at index ${index} for Base64 encoding`)
      }
      index++
      const number = (charIndex << 18) + (charIndex2 << 12) + (charIndex3 << 6) + charIndex4
      result[resultIndex++] = number >> 16 & 0xff
      result[resultIndex++] = number >> 8 & 0xff
      result[resultIndex++] = number & 0xff
    }
    if (extraBytes === 1) {
      const charCode = input[index]
      const charIndex = baseMapLookup[charCode]
      if (charIndex === undefined) {
        throw new SyntaxError(`Invalid byte "${NumberPrototypeToString(charCode, 16)}" at index ${index} for Base64 encoding`)
      }
    } else if (extraBytes === 2) {
      const charCode = input[index]
      const charIndex = baseMapLookup[charCode]
      if (charIndex === undefined) {
        throw new SyntaxError(`Invalid byte "${NumberPrototypeToString(charCode, 16)}" at index ${index} for Base64 encoding`)
      }
      index++
      const charCode2 = input[index]
      const charIndex2 = baseMapLookup[charCode2]
      if (charIndex2 === undefined) {
        throw new SyntaxError(`Invalid byte "${NumberPrototypeToString(charCode2, 16)}" at index ${index} for Base64 encoding`)
      }
      const number = (charIndex << 2) + (charIndex2 >> 4)
      result[resultIndex] = number & 0xff
    } else if (extraBytes === 3) {
      const charCode = input[index]
      const charIndex = baseMapLookup[charCode]
      if (charIndex === undefined) {
        throw new SyntaxError(`Invalid byte "${NumberPrototypeToString(charCode, 16)}" at index ${index} for Base64 encoding`)
      }
      index++
      const charCode2 = input[index]
      const charIndex2 = baseMapLookup[charCode2]
      if (charIndex2 === undefined) {
        throw new SyntaxError(`Invalid byte "${NumberPrototypeToString(charCode2, 16)}" at index ${index} for Base64 encoding`)
      }
      index++
      const charCode3 = input[index]
      const charIndex3 = baseMapLookup[charCode3]
      if (charIndex3 === undefined) {
        throw new SyntaxError(`Invalid byte "${NumberPrototypeToString(charCode3, 16)}" at index ${index} for Base64 encoding`)
      }
      const number = (charIndex << 10) + (charIndex2 << 4) + (charIndex3 >> 2)
      result[resultIndex++] = number >> 8 & 0xff
      result[resultIndex] = number & 0xff
    }
    return result
  }

  encodeToString(input, start, end) {
    if (!InstancesIsUint8Array(input)) {
      throw new TypeError('The input must be an instance of Uint8Array')
    }
    return this[encodeToStringSymbol](input, start, end)
  }

  decodeFromString(input, start, end) {
    if (!PrimitivesIsString(input)) {
      throw new TypeError('The input must be a string')
    }
    return this[decodeFromStringSymbol](input, start, end)
  }
}

const isBase64 = FunctionPrototypeBind(FunctionPrototypeSymbolHasInstance, null, Base64)

const base64 = new Base64()
const encodeInt = FunctionPrototypeBind(Base64.prototype.encodeInt, base64)
const decodeInt = FunctionPrototypeBind(Base64.prototype.decodeInt, base64)
const encodeBigInt = FunctionPrototypeBind(Base64.prototype.encodeBigInt, base64)
const decodeBigInt = FunctionPrototypeBind(Base64.prototype.decodeBigInt, base64)
const encodeText = FunctionPrototypeBind(Base64.prototype.encodeText, base64)
const decodeText = FunctionPrototypeBind(Base64.prototype.decodeText, base64)
const encode = FunctionPrototypeBind(Base64.prototype.encode, base64)
const decode = FunctionPrototypeBind(Base64.prototype.decode, base64)
const encodeToString = FunctionPrototypeBind(Base64.prototype.encodeToString, base64)
const decodeFromString = FunctionPrototypeBind(Base64.prototype.decodeFromString, base64)

ObjectDefineProperties(Base64, {
  BASE: {
    value: BASE
  },
  ALPHABET: {
    value: ALPHABET
  },
  BITS_PER_CHAR: {
    value: BITS_PER_CHAR
  },
  PADDING_CHAR: {
    value: PADDING_CHAR
  },
  NEGATIVE_CHAR: {
    value: NEGATIVE_CHAR
  },
  isBase64: {
    value: isBase64
  },
  isAlphabet: {
    value: isAlphabet
  },
  isBase64String: {
    value: isBase64String
  },
  encodeInt: {
    value: encodeInt
  },
  decodeInt: {
    value: decodeInt
  },
  encodeBigInt: {
    value: encodeBigInt
  },
  decodeBigInt: {
    value: decodeBigInt
  },
  encodeText: {
    value: encodeText
  },
  decodeText: {
    value: decodeText
  },
  encode: {
    value: encode
  },
  decode: {
    value: decode
  },
  encodeToString: {
    value: encodeToString
  },
  decodeFromString: {
    value: decodeFromString
  }
})
ObjectDefineProperties(Base64.prototype, {
  [SymbolToStringTag]: {
    value: 'Base64'
  }
})

export {
  BASE,
  ALPHABET,
  BITS_PER_CHAR,
  PADDING_CHAR,
  NEGATIVE_CHAR,
  isBase64,
  isAlphabet,
  isBase64String,
  encodeInt,
  decodeInt,
  encodeBigInt,
  decodeBigInt,
  encodeText,
  decodeText,
  encode,
  decode,
  encodeToString,
  decodeFromString
}
export default Base64
