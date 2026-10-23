import dns from "node:dns";

// Configure DNS servers
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Prefer IPv4 addresses when Node.js resolves hostnames
dns.setDefaultResultOrder("ipv4first");
