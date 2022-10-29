import nodes from "./configurations/nodes.json";
import MessageManager from "./core/MessageManager";
import Node from "./core/Node";
import { NodeGroup } from "./core/NodeGroup";
import { Message, ReadyMessage } from "./messages/messages";

/*
    Information about the node of this instance.
*/

const NODE_ID = process.env.NODE_ID || "1";
const NODE_PORT = parseInt(process.env.NODE_PORT || "8000");
const NODE_HOST = process.env.NODE_HOST || "172.24.2.1";
const NODE_CHANCE = parseFloat(process.env.NODE_CHANCE || "0.5");
const NODE_EVENTS = parseInt(process.env.NODE_EVENTS || "100");
const NODE_MIN_DELAY = parseInt(process.env.NODE_MIN_DELAY || "200");
const NODE_MAX_DELAY = parseInt(process.env.NODE_MAX_DELAY || "500");

/*
    Adding other nodes to the node group.
*/

for (const node of nodes.nodes) {
  if (node.id !== NODE_ID) {
    const otherNode = new Node(node.id, node.host, node.port);
    NodeGroup.addNode(otherNode);
  }
}

/*
    Creating the message manager
    and waiting for all nodes to be ready.
*/

const messageManager = new MessageManager(NODE_PORT);
console.log("Waiting for all nodes to be ready...");

const READY_MESSAGE: ReadyMessage = {
  type: "ready",
  nodeId: NODE_ID,
};

messageManager.onMulticastMessage((message) => {
  if (NodeGroup.areAllNodesReady()) {
    return;
  }
  const parsedMessage = JSON.parse(message) as Message;
  if (parsedMessage.type === "ready") {
    const readyMessage = parsedMessage as ReadyMessage;
    if (readyMessage.nodeId !== NODE_ID) {
      NodeGroup.markNodeAsReady(readyMessage.nodeId);
    }
    if (NodeGroup.areAllNodesReady()) {
      console.log("[OK] All nodes are ready. Starting simulation...");
    } else {
      setTimeout(() => {
        messageManager.sendMulticast(READY_MESSAGE);
      }, 1000);
    }
  }
});

messageManager.sendMulticast(READY_MESSAGE);
