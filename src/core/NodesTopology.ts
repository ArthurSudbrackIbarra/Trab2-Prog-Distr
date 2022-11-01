import Node from "./Node";

export default class NodesTopology {
  private nodes: Node[];

  constructor() {
    this.nodes = [];
  }

  public addNode(node: Node): void {
    this.nodes.push(node);
  }

  public getNodesCount(): number {
    return this.nodes.length;
  }

  public getNodeById(id: string): Node | undefined {
    return this.nodes.find((node) => node.getId() === id);
  }

  public getNodeIds(): string[] {
    return this.nodes.map((node) => node.getId());
  }

  public getRandomNode(): Node {
    const randomIndex = Math.floor(Math.random() * this.nodes.length);
    return this.nodes[randomIndex];
  }
}
