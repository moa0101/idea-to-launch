// All balance tunables in one place. Change a number, reload, play.
export const CFG = {
  WIDTH: 720,
  HEIGHT: 1280,
  SHIFT_SECONDS: 180, // clock seconds; drive time is compressed, so real play ≈ 2–3 min
  SEC_PER_MIN: 1, // clock seconds spent per in-game route minute while driving
  EDGE_MIN: 2, // minutes to drive one normal street block
  TRAFFIC_MULT: 3, // red traffic roads are this many times slower
  BLOCK_PENALTY: 3, // seconds lost per parcel blocked from the door
  VALUE_PER_CELL: 10, // points per parcel cell delivered
  FULL_PACK_BONUS: 100, // every parcel of the round packed
  BEST_ROUTE_BONUS: 50, // route is as fast as the best possible order
  CELL: 80, // van cell size in px
  DRIVE_MS_PER_MIN: 110, // animation speed of the van
  RESULT_MS: 2200, // round result overlay time
} as const;
