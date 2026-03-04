# 8gent Toolshed

> Claude Code for everyone

A simple, consumer-friendly tool registry for 8gent.app. No complexity, just works.

## Quick Start

```bash
# Install dependencies
bun install

# Set up Convex (first time)
npx convex dev

# Copy and configure env
cp .env.example .env
# Add your CONVEX_URL to .env

# Run the server
bun dev
```

## API

### List Tools
```bash
GET /api/tools
GET /api/tools?category=productivity
GET /api/tools?type=builtin
```

### Find Tool for Task
```bash
GET /api/tools/query?task=calculate+something
```

### Invoke a Tool
```bash
POST /api/tools/invoke/:id
{
  "input": { "expression": "2 + 2" },
  "userId": "optional-user-id"
}
```

### Create Custom Tool
```bash
POST /api/tools
{
  "name": "my-tool",
  "description": "Does something cool",
  "category": "other",
  "inputSchema": { "param": { "type": "string" } }
}
```

### Seed Builtin Tools
```bash
POST /api/tools/seed
```

## Builtin Tools

| Tool | Category | Description |
|------|----------|-------------|
| web-search | productivity | Search the web |
| calculator | productivity | Math calculations |
| file-reader | productivity | Read files |
| image-generator | media | Generate images |
| summarizer | productivity | Summarize text |

## Tool Categories

- `productivity` - Get things done
- `communication` - Connect with others
- `media` - Images, video, audio
- `dev` - Developer tools
- `other` - Everything else

## Tool Types

- `builtin` - Ships with 8gent
- `community` - User-contributed
- `custom` - Your own tools

## Stack

- **Runtime:** Bun
- **Framework:** Hono
- **Database:** Convex
- **Validation:** Zod

## License

MIT
