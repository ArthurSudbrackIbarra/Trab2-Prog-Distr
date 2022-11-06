export default class VectorClock {
  private nodeId: string;
  private nodeIds: string[];
  private clock: Map<string, number>;

  constructor(nodeId: string, nodeIds: string[]) {
    this.nodeId = nodeId;
    this.nodeIds = nodeIds;

    this.clock = new Map<string, number>();
    this.nodeIds.forEach((id) => {
      if (!this.clock.has(id)) {
        this.clock.set(id, 0);
      }
    });
  }

  public increment(): void {
    const currentValue = this.clock.get(this.nodeId) || 0;
    this.clock.set(this.nodeId, currentValue + 1);
  }

  public update(clock: Map<string, number>): void {
    clock.forEach((clockValue, nodeId) => {
      const currentClockValue = this.clock.get(nodeId) || 0;
      if (nodeId === this.nodeId) {
        return;
      }
      if (clockValue > currentClockValue) {
        this.clock.set(nodeId, clockValue);
      }
    });
  }

  public serialize(): any {
    const serializedClock: { [key: string]: number } = {};
    this.clock.forEach((value, key) => {
      serializedClock[key] = value;
    });
    return serializedClock;
  }

  public deserialize(serializedClock: any): Map<string, number> {
    const deserializedClock = new Map<string, number>();
    Object.keys(serializedClock).forEach((key) => {
      deserializedClock.set(key, serializedClock[key]);
    });
    return deserializedClock;
  }

  public toString(): string {
    return JSON.stringify(this.serialize());
  }
}
