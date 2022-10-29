import Node from "./Node";

export class NodeGroup {
  private static nodes: Node[] = [];

  public static addNode(node: Node): void {
    this.nodes.push(node);
  }

  public static getNodeById(id: string): Node | undefined {
    return this.nodes.find((node) => node.getId() === id);
  }
}
