class MatchContext {
  mode: string | undefined;
  player: string | undefined;
  time: number | undefined;
  room: string | undefined;

  constructor({ mode, player, time, room }: Context) {
    (this.mode = mode),
      (this.player = player),
      (this.time = time),
      (this.room = room);
  }
}

export default MatchContext;

type Context = {
  mode?: string | undefined;
  player?: string | undefined;
  room?: string | undefined;
  time?: number | undefined;
};
