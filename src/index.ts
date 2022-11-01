import nodes from "./configurations/nodes.json";
import MessageManager from "./core/MessageManager";
import Node from "./core/Node";
import { NodeGroup } from "./core/NodeGroup";
import VectorClock from "./core/VectorClock";
import {
  AllReadyMessage,
  ClockMessage,
  Message,
  ReadyMessage,
} from "./messages/messages";
import { BLUE, GREEN, RESET } from "./utils/colors";

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
console.log(`[${BLUE}STARTED${RESET}] ${NODE_ID} | ${NODE_HOST}:${NODE_PORT}`);

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
  Creating the message manager to send/receive messages
  and waiting for all nodes to be ready.
*/
const messageManager = new MessageManager(NODE_PORT);
console.log("Waiting for all nodes to be ready...");

const READY_MESSAGE: ReadyMessage = {
  type: "ready",
  nodeId: NODE_ID,
};
const ALL_READY_MESSAGE: AllReadyMessage = {
  type: "allReady",
  nodeId: NODE_ID,
};

messageManager.onMulticastMessage((message) => {
  const parsedMessage = JSON.parse(message) as Message;
  if (parsedMessage.type === "ready") {
    const readyMessage = parsedMessage as ReadyMessage;
    if (readyMessage.nodeId !== NODE_ID) {
      NodeGroup.markNodeAsReady(readyMessage.nodeId);
    }
    if (NodeGroup.areAllNodesReady()) {
      console.log(
        `[${GREEN}OK${RESET}] All nodes are ready. Sending all-ready multicast message and starting simulation.`
      );
      messageManager.onMulticastMessage(null);
      messageManager.sendMulticast(ALL_READY_MESSAGE);
      startSimulation();
    } else {
      setTimeout(() => {
        messageManager.sendMulticast(READY_MESSAGE);
      }, 500);
    }
  } else if (parsedMessage.type === "allReady") {
    console.log(
      `[${GREEN}OK${RESET}] All nodes are ready. Starting simulation.`
    );
    messageManager.onMulticastMessage(null);
    startSimulation();
  }
});

messageManager.sendMulticast(READY_MESSAGE);

/*
  OK, now all nodes are ready. The simulation can start.
*/
async function startSimulation(): Promise<void> {
  const vectorClock = new VectorClock(NODE_ID, NodeGroup.getNodeIds());
  let events = 0;
  /*
    What to do when receiving a clock message.
  */
  messageManager.onUnicastMessage((message) => {
    console.log(`Received message: ${message}`);
    const parsedMessage = JSON.parse(message) as Message;
    if (parsedMessage.type === "clock") {
      const clockMessage = parsedMessage as ClockMessage;
      const otherClock = vectorClock.deserialize(clockMessage.clock);
      vectorClock.update(otherClock);
      console.log(`Clock after update: ${vectorClock.toString()}`);
    }
  });
  /*
    Loop until the max number of events is reached.
  */
  while (events < NODE_EVENTS) {
    /*
      Chance of local or remote event.
    */
    let eventType = "local";
    if (Math.random() >= NODE_CHANCE) {
      eventType = "remote";
    }
    /*
      Increment the clock.
    */
    vectorClock.increment();
    if (eventType === "local") {
      /*
        Local event.
      */
      console.log(`Local event: ${vectorClock.toString()}`);
    } else {
      /*
        Remote event.
      */
      console.log(`Remote event: ${vectorClock.toString()}`);
      const randomNode = NodeGroup.getRandomNode();
      const clockMessage: ClockMessage = {
        type: "clock",
        nodeId: NODE_ID,
        clock: vectorClock.serialize(),
      };
      messageManager.sendUnicast(clockMessage, randomNode, true);
    }
    /*
      Wait a random time before the next event.
    */
    const randomDelay = Math.floor(
      Math.random() * (NODE_MAX_DELAY - NODE_MIN_DELAY) + NODE_MIN_DELAY
    );
    await new Promise((resolve) => setTimeout(resolve, randomDelay));
    events++;
  }
  console.log(`${GREEN}[OK]${RESET} Simulation finished.`);
}
