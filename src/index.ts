import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { server } from "./server.ts";
import "./tools.ts";
import "./prompt.ts";
import dotenv from "dotenv";
import process from "node:process";

dotenv.config();

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Movie Assistant MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
