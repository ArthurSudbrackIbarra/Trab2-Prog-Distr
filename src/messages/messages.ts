export interface Message {
  type: string;
}

export interface ReadyMessage extends Message {
  type: "ready";
  nodeId: string;
}
