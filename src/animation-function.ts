/**
 * Functions intended for animation of the clock hands.
 *
 * These functions take a number (typically a floating point number in the range 0..12 or 0..60)
 * and map that number to another floating point number in the same range.
 *
 * https://www.desmos.com/calculator/ic7qjzw3mf
 */
export const AnimationFunction = (() => {
  /**
   * This is the identity function, it maps every number to itself.
   * The hand will move smoothly and always point exactly to the current time.
   * @param x the input value
   */
  const sweep: (x: number) => number = (x) => x
  /**
   * `hardTick` will always return the input value rounded down to the next integer.
   * The hand will jump immediately to the next full second from one rendered frame to another.
   */
  const hardTick: (x: number) => number = Math.floor;

  /**
   * Can be used to animate a ticking animation, which slows down around whole numbers and speeds up in between.
   * @param x
   */
  const softTick: (x: number) => number = (x: number) => Math.floor(x + .5) + 4 * Math.pow(x - Math.floor(x + .5), 3)

  /**
   * Adds a pause at the end of the animation cycle. The part before the pause is sped up linearly to fit in.
   *
   * This can be used to make the clock behave like (old) train station clocks,
   * whose second hand runs a bit faster than one round per minute.
   * At the top it waits for a second or two before continuing with the next round.
   *
   * @param max the maximum input/output value (use 12 for the hours, or 60 for minutes or seconds)
   * @param pause the number of units for which the hand should be paused at the top
   * @return { function(x: number): number }
   */
  function pauseAtEnd(max: number, pause: number): (x: number) => number {
    if (pause <= 0) {
      return (x) => x;
    }
    if (max <= 0) {
      throw new Error(`max value must be greater than 0 (was ${ max })`);
    }
    return (x: number) => Math.min(max, x / (1 - Math.min(max, pause) / max))
  }

  return {
    hardTick,
    pauseAtEnd,
    softTick,
    sweep,
  }
})();