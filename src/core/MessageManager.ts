import dgram, { Socket } from "dgram";
import { MULTICAST_ADDRESS, MULTICAST_PORT } from "./constants";
import Node from "./Node";

export default class MessageManager {
  private unicastSocket: Socket;
  private _onUnicastMessage: (message: string) => void;

  private multicastSocket: Socket;
  private _onMulticastMessage: (message: string) => void;

  constructor(unicastSocketPort: number) {
    this.unicastSocket = dgram.createSocket("udp4");
    this.unicastSocket.bind(unicastSocketPort);
    this._onUnicastMessage = (_message) => {};

    this.multicastSocket = dgram.createSocket("udp4");
    this.multicastSocket.bind(MULTICAST_PORT);
    this._onMulticastMessage = (_message) => {};

    this.start();
  }

  public onUnicastMessage(func: (message: string) => void): void {
    this._onUnicastMessage = func;
  }
  public onMulticastMessage(func: (message: string) => void): void {
    this._onMulticastMessage = func;
  }

  private start(): void {
    this.unicastSocket.on("message", (message) => {
      this._onUnicastMessage(message.toString());
    });
    this.multicastSocket.on("listening", () => {
      this.multicastSocket.setBroadcast(true);
      this.multicastSocket.setMulticastTTL(128);
      this.multicastSocket.addMembership(MULTICAST_ADDRESS);
    });
    this.multicastSocket.on("message", (message) => {
      this._onMulticastMessage(message.toString());
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
      console.log(`Sending Unicast to ${node.getId()}: ${jsonMessage}`);
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
      console.log(`Sending Multicast: ${jsonMessage}`);
    }
  }
}
