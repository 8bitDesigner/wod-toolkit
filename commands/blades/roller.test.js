const roller = require('./roller.js')

function seedRandom (values) {
  if (!Array.isArray(values)) { values = [values] }

  const mockMath = Object.create(global.Math)
  mockMath.random = jest.fn()

  values.reduce(
    (fn, value) => fn.mockReturnValueOnce(value),
    mockMath.random
  )

  global.Math = mockMath
}

describe('roller', () => {
  describe('.roll', () => {
    it('default to a single die', () => {
      seedRandom(0.5)
      expect(roller.roll()).toEqual([4])
    })

    it('should go as low as 1', () => {
      seedRandom([0.1])
      expect(roller.roll()).toEqual([1])
    })

    it('should go as low as high as 6', () => {
      seedRandom([0.9])
      expect(roller.roll()).toEqual([6])
    })

    it('should allow you to roll multiple die', () => {
      seedRandom([0.17, 0.35, 0.57])
      expect(roller.roll(3)).toEqual([2, 3, 4])
    })

    it('should return an empty array if you ask for zero', () => {
      expect(roller.roll(0)).toEqual([])
    })
  })

  describe('.rollWithContext', () => {
    describe('when rolling normally', () => {
      it('should count multiple 6 results as a crit', () => {
        seedRandom([0.9, 0.1, 0.1, 0.9])

        expect(roller.rollWithContext(4)).toEqual({
          rolls: [6, 6, 1, 1],
          type: 'critical'
        })
      })

      it('should count a single 6 as a success', () => {
        seedRandom([0.9, 0.1, 0.1])

        expect(roller.rollWithContext(3)).toEqual({
          rolls: [6, 1, 1],
          type: 'success'
        })
      })

      it('should count a 5 as a partial success', () => {
        seedRandom([0.7])

        expect(roller.rollWithContext(1)).toEqual({
          rolls: [5],
          type: 'partial'
        })
      })

      it('should count 4 as a partial success', () => {
        seedRandom([0.6])

        expect(roller.rollWithContext(1)).toEqual({
          rolls: [4],
          type: 'partial'
        })
      })

      it('should count 1, 2, and 3 as a failure', () => {
        seedRandom([0.1, 0.33, 0.39])

        expect(roller.rollWithContext(3)).toEqual({
          rolls: [3, 2, 1],
          type: 'failure'
        })
      })
    })

    describe('when rolling desperately', () => {
      it('should resolve the lower of the two numbers', () => {
        seedRandom([0.1, 0.9])

        expect(roller.rollWithContext(0)).toEqual({
          rolls: [6, 1],
          type: 'failure'
        })
      })

      it('should allow success', () => {
        seedRandom([0.5, 0.9])

        expect(roller.rollWithContext(0)).toEqual({
          rolls: [6, 4],
          type: 'partial'
        })
      })

      it('shouldn\'t allow crits', () => {
        seedRandom([0.9, 0.9])

        expect(roller.rollWithContext(0)).toEqual({
          rolls: [6, 6],
          type: 'success'
        })
      })
    })
  })
})
