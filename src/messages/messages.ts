export interface Message {
  type: string;
}

export interface ReadyMessage extends Message {
  type: "ready";
  nodeId: string;
}

export interface ClockMessage extends Message {
  type: "clock";
  nodeId: string;
  clock: any;
}
