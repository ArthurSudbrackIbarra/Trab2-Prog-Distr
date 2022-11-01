import dgram, { Socket } from "dgram";
import { MULTICAST_ADDRESS, MULTICAST_PORT } from "./constants";
import Node from "./Node";

export default class MessageManager {
  private unicastSocket: Socket;
  private _onUnicastMessage: ((message: string) => void) | null;

  private multicastSocket: Socket;
  private _onMulticastMessage: ((message: string) => void) | null;

  constructor(unicastSocketPort: number) {
    this.unicastSocket = dgram.createSocket("udp4");
    this.unicastSocket.bind(unicastSocketPort);
    this._onUnicastMessage = null;

    this.multicastSocket = dgram.createSocket("udp4");
    this.multicastSocket.bind(MULTICAST_PORT);
    this._onMulticastMessage = null;

    this.start();
  }

  public onUnicastMessage(func: ((message: string) => void) | null): void {
    this._onUnicastMessage = func;
  }
  public onMulticastMessage(func: ((message: string) => void) | null): void {
    this._onMulticastMessage = func;
  }

  private start(): void {
    this.unicastSocket.on("message", (message) => {
      if (this._onUnicastMessage) {
        this._onUnicastMessage(message.toString());
      }
    });
    this.multicastSocket.on("listening", () => {
      this.multicastSocket.setBroadcast(true);
      this.multicastSocket.setMulticastTTL(128);
      this.multicastSocket.addMembership(MULTICAST_ADDRESS);
    });
    this.multicastSocket.on("message", (message) => {
      if (this._onMulticastMessage) {
        this._onMulticastMessage(message.toString());
      }
    });
  }

  public sendUnicast(message: any, node: Node, print = false): void {
    const jsonMessage = JSON.stringify(message);
    this.unicastSocket.send(
      Buffer.from(jsonMessage),
      node.getPort(),
      node.getHost()
    );
    if (print) {
      console.log(`Sending unicast to "${node.getId()}": ${jsonMessage}`);
    }
  }

  public sendMulticast(message: any, print = false): void {
    const jsonMessage = JSON.stringify(message);
    this.multicastSocket.send(
      Buffer.from(jsonMessage),
      MULTICAST_PORT,
      MULTICAST_ADDRESS
    );
    if (print) {
      console.log(`Sending multicast: ${jsonMessage}`);
    }
  }
}
