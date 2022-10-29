export default class Node {
  private id: string;
  private host: string;
  private port: number;

  constructor(id: string, host: string, port: number) {
    this.id = id;
    this.host = host;
    this.port = port;
  }

  public getId(): string {
    return this.id;
  }
  public getHost(): string {
    return this.host;
  }
  public getPort(): number {
    return this.port;
  }
}
