const CHARS = 'ABCDEFGHIJKLMNabcdefghijklmn1234567890'
const YEAR = 2016
const RANDOM_MIN = 0
const RANDOM_MAX = 999999
const RANDOM_SIZE = 6
const PAD = '0'

export class ID {
  static generate() {
    const date = new Date()
    const year = date.getFullYear() - YEAR
    const month = date.getMonth()
    const day = date.getDay()
    const ms = date.getMilliseconds()
    const _ms = this.dataLeftCompleting(8, PAD, ms)
    const _random = this.dataLeftCompleting(
      RANDOM_SIZE,
      PAD,
      ID.random(RANDOM_MIN, RANDOM_MAX)
    )
    return `${CHARS[year]}${CHARS[month]}${CHARS[day]}${_ms}${_random}`
  }

  static random(min: number, max: number) {
    const choices = max - min + 1
    return Math.floor(Math.random() * choices + min)
  }

  static dataLeftCompleting(bits: number, identifier: string, value: number) {
    const _value = Array(bits + 1).join(identifier) + value
    return _value.slice(-bits)
  }
}
