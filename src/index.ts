const NODE_ID = process.env.NODE_ID || "1";
const NODE_PORT = parseInt(process.env.NODE_PORT || "8000");
const NODE_HOST = process.env.NODE_HOST || "172.24.2.1";
const NODE_CHANCE = parseFloat(process.env.NODE_CHANCE || "0.5");
const NODE_EVENTS = parseInt(process.env.NODE_EVENTS || "100");
const NODE_MIN_DELAY = parseInt(process.env.NODE_MIN_DELAY || "200");
const NODE_MAX_DELAY = parseInt(process.env.NODE_MAX_DELAY || "500");

console.log(`NODE ID: ${NODE_ID}`);
console.log(`NODE PORT: ${NODE_PORT}`);
console.log(`NODE HOST: ${NODE_HOST}`);
console.log(`NODE CHANCE: ${NODE_CHANCE}`);
console.log(`NODE EVENTS: ${NODE_EVENTS}`);
console.log(`NODE MIN DELAY: ${NODE_MIN_DELAY}`);
console.log(`NODE MAX DELAY: ${NODE_MAX_DELAY}`);
