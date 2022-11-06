import nodes from "./configurations/nodes.json";
import MessageManager from "./core/MessageManager";
import Node from "./core/Node";
import NodesTopology from "./core/NodesTopology";
import VectorClock from "./core/VectorClock";
import {
  ACKMessage,
  AllReadyMessage,
  ClockMessage,
  Message,
  ReadyMessage,
} from "./messages/messages";
import { BLUE, GREEN, RED, RESET } from "./utils/colors";

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
const nodesTopology = new NodesTopology();
for (const node of nodes.nodes) {
  if (node.id !== NODE_ID) {
    const friendNode = new Node(node.id, node.host, node.port);
    nodesTopology.addNode(friendNode);
  }
}

/*
  Creating the message manager to send/receive messages
  and waiting for all nodes to be ready.
*/
const messageManager = new MessageManager(NODE_PORT);
console.log("Waiting for all nodes to be ready...");

const readyNodes: string[] = [];
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
    if (
      readyMessage.nodeId !== NODE_ID &&
      !readyNodes.includes(readyMessage.nodeId)
    ) {
      readyNodes.push(readyMessage.nodeId);
    }
    if (readyNodes.length === nodesTopology.getNodesCount()) {
      console.log(
        `[${GREEN}OK${RESET}] All nodes are ready. Sending "all ready" multicast message and starting simulation.`
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
      `[${GREEN}OK${RESET}] All nodes are ready - via "all ready" multicast message. Starting simulation.`
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
  const vectorClock = new VectorClock(NODE_ID, nodesTopology.getNodeIds());
  let events = 0;
  let ackMap = new Map<string, number>();
  startACKsCheckRoutine(ackMap);
  /*
    What to do when receiving a clock message.
  */
  messageManager.onUnicastMessage((message) => {
    const parsedMessage = JSON.parse(message) as Message;
    if (parsedMessage.type === "clock") {
      const clockMessage = parsedMessage as ClockMessage;
      const otherClock = vectorClock.deserialize(clockMessage.clock);
      vectorClock.update(otherClock);
      console.log(
        `${NODE_ID} ${vectorClock.toString()} R ${
          clockMessage.nodeId
        } ${otherClock.get(clockMessage.nodeId)}`
      );
      /*
        Sending an ACK message.
      */
      const ACK_MESSAGE: ACKMessage = {
        type: "ack",
        nodeId: NODE_ID,
        replyMessageId: clockMessage.messageId as string,
      };
      const friendNode = nodesTopology.getNodeById(clockMessage.nodeId);
      if (friendNode) {
        messageManager.sendUnicast(ACK_MESSAGE, friendNode);
      }
    } else if (parsedMessage.type === "ack") {
      const ackMessage = parsedMessage as ACKMessage;
      ackMap.delete(ackMessage.replyMessageId);
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
      console.log(`${NODE_ID} ${vectorClock.toString()} L`);
    } else {
      /*
        Remote event.
      */
      const randomNode = nodesTopology.getRandomNode();
      const clockMessage: ClockMessage = {
        type: "clock",
        nodeId: NODE_ID,
        clock: vectorClock.serialize(),
      };
      const messageId = messageManager.sendUnicast(clockMessage, randomNode);
      ackMap.set(messageId, Date.now());
      console.log(
        `${NODE_ID} ${vectorClock.toString()} S ${randomNode.getId()}`
      );
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
  process.exit(0);
}

/*
  Routine to keep checking if the messages being sent are being acknowledged.
*/
function startACKsCheckRoutine(ackMap: Map<string, number>) {
  setInterval(() => {
    ackMap.forEach((time, messageId) => {
      if (Date.now() - time > 2500) {
        console.log(
          `[${RED}TERMINATING${RESET}] Message with ID "${messageId}" was not acknowledged. Terminating.`
        );
        process.exit(0);
      }
    });
  }, 500);
}
