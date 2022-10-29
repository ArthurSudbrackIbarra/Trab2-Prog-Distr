import Node from "./Node";

export class NodeGroup {
  private static nodes: Node[] = [];
  private static readyNodes: Map<string, boolean> = new Map();

  public static addNode(node: Node): void {
    this.nodes.push(node);
  }

  public static getNodeById(id: string): Node | undefined {
    return this.nodes.find((node) => node.getId() === id);
  }

  public static markNodeAsReady(id: string): void {
    this.readyNodes.set(id, true);
  }
  public static areAllNodesReady(): boolean {
    return this.nodes.length === this.readyNodes.size;
  }
}
