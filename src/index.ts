import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { server } from "./server.js";
import "./tools.js";
import process from "node:process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile(filePath: string) {
    let contents: string;

    try {
        contents = readFileSync(filePath, "utf8");
    } catch {
        return;
    }

    for (const line of contents.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) {
            continue;
        }

        const equalsIndex = trimmed.indexOf("=");
        if (equalsIndex === -1) {
            continue;
        }

        const key = trimmed.slice(0, equalsIndex).trim();
        let value = trimmed.slice(equalsIndex + 1).trim();

        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }

        if (key && process.env[key] === undefined) {
            process.env[key] = value;
        }
    }
}

loadEnvFile(resolve(process.cwd(), ".env"));

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Movie Assistant MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
