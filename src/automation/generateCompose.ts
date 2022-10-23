import fs from "fs";
import { BLUE, GREEN, RESET, YELLOW_BLINK } from "../utils/colors";
import nodes from "../configurations/nodes.json";

/*
  Generating docker-compose.yaml file.
*/

console.log(`--- ${BLUE}Generating docker-compose.yaml file${RESET} ---\n`);

const DOCKER_COMPOSE_FILE_PATH = "docker-compose.yaml";

let dockerComposeContent = "";
dockerComposeContent += 'version: "3.9"\n';
dockerComposeContent += `networks:
  nodes_network:
    driver: bridge
    ipam:
      driver: default
      config:
        - subnet: 172.24.2.0/16
`;
dockerComposeContent += "services:\n";

for (const node of nodes.nodes) {
  dockerComposeContent += `  node-${node.id}:\n`;
  dockerComposeContent += `    container_name: node-${node.id}\n`;
  dockerComposeContent += `    networks:\n`;
  dockerComposeContent += `      nodes_network:\n`;
  dockerComposeContent += `        ipv4_address: ${node.host}\n`;
  dockerComposeContent += "    build: .\n";
  dockerComposeContent += "    environment:\n";
  dockerComposeContent += `      NODE_ID: ${node.id}\n`;
  dockerComposeContent += `      NODE_HOST: ${node.host}\n`;
  dockerComposeContent += `      NODE_PORT: ${node.port}\n`;
  dockerComposeContent += `      NODE_CHANCE: ${node.chance}\n`;
  dockerComposeContent += `      NODE_EVENTS: ${node.events}\n`;
  dockerComposeContent += `      NODE_MIN_DELAY: ${node.min_delay}\n`;
  dockerComposeContent += `      NODE_MAX_DELAY: ${node.max_delay}\n`;
}

try {
  fs.writeFileSync(DOCKER_COMPOSE_FILE_PATH, dockerComposeContent);
  console.log(`[${GREEN}OK${RESET}] docker-compose.yaml generated.\n`);
} catch (error) {
  console.error(`Unnable to write docker-compose.yml file: ${error}`);
  process.exit(1);
}

console.log(
  `\n${YELLOW_BLINK}=> ${RESET}Por favor, antes de continuar, leia o README do projeto com as instruções de como operar o sistema.\n`
);
console.log("Pressione qualquer tecla para continuar...\n");
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on("data", process.exit.bind(process, 0));
