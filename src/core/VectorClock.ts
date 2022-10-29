export default class VectorClock {
  private nodeId: string;
  private nodeIds: string[];
  private clock: Map<string, number>;

  constructor(nodeId: string, nodeIds: string[]) {
    this.nodeId = nodeId;
    this.nodeIds = nodeIds;
    this.clock = new Map<string, number>();
    this.mountClockMap();
  }

  private mountClockMap(): void {
    this.nodeIds.forEach((id) => {
      if (!this.clock.has(id)) {
        this.clock.set(id, 0);
      }
    });
  }

  public localEvent(): void {
    const currentValue = this.clock.get(this.nodeId) || 0;
    this.clock.set(this.nodeId, currentValue + 1);
  }

  public serialize(): any {
    const serializedClock: { [key: string]: number } = {};
    this.clock.forEach((value, key) => {
      serializedClock[key] = value;
    });
    return serializedClock;
  }

  public deserialize(serializedClock: string): Map<string, number> {
    const parsedClock = JSON.parse(serializedClock);
    const deserializedClock = new Map<string, number>();
    Object.keys(parsedClock).forEach((key) => {
      deserializedClock.set(key, parsedClock[key]);
    });
    return deserializedClock;
  }
}
