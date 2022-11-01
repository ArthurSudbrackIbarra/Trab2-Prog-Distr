import Node from "./Node";

export class NodesTopology {
  private static nodes: Node[] = [];

  public static addNode(node: Node): void {
    this.nodes.push(node);
  }

  public static getNodesCount(): number {
    return this.nodes.length;
  }

  public static getNodeById(id: string): Node | undefined {
    return this.nodes.find((node) => node.getId() === id);
  }

  public static getNodeIds(): string[] {
    return this.nodes.map((node) => node.getId());
  }

  public static getRandomNode(): Node {
    const randomIndex = Math.floor(Math.random() * this.nodes.length);
    return this.nodes[randomIndex];
  }
}
