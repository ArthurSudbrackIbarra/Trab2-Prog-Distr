export interface Message {
  type: string;
  messageId?: string;
  nodeId: string;
}

export interface ReadyMessage extends Message {
  type: "ready";
}
export interface AllReadyMessage extends Message {
  type: "allReady";
}

export interface ClockMessage extends Message {
  type: "clock";
  clock: any;
}

export interface ACKMessage extends Message {
  type: "ack";
  replyMessageId: string;
}
