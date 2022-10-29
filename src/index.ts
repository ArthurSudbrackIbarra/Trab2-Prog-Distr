import nodes from "./configurations/nodes.json";
import MessageManager from "./core/MessageManager";
import Node from "./core/Node";
import { NodeGroup } from "./core/NodeGroup";

/*
    Current node information.
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

const messageManager = new MessageManager(NODE_PORT);

messageManager.onUnicastMessage((message) => {
  console.log(`Unicast message received: ${message}`);
});
messageManager.onMulticastMessage((message) => {
  console.log(`Multicast message received: ${message}`);
  setTimeout(() => {
    messageManager.sendMulticast({
      hello: "world",
    });
  }, 2000);
});

messageManager.sendMulticast({
  hello: "world",
});

messageManager.start();
