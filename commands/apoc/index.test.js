const ApocCommand = require('./index.js')

describe('ApocCommand#modifier', () => {


  it('returns zero if you have a blank input', () => {
    expect(new ApocCommand().modifier('')).toEqual(0)
  })

  it('returns zero if you have blank, padded input', () => {
    expect(new ApocCommand().modifier('')).toEqual(0)
  })

  it('parses modifiers', () => {
    expect(new ApocCommand().modifier('1')).toEqual(1)
  })

  it('parses positive modifiers', () => {
    expect(new ApocCommand().modifier('+2')).toEqual(2)
  })

  it('parses negative modifiers', () => {
    expect(new ApocCommand().modifier('-3')).toEqual(-3)
  })
})
