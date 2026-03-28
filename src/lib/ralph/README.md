# Ralph Loop Integration

This directory contains the integration of the [ralph-loop-agent](https://github.com/8gi-foundation/ralph-loop-agent) SDK with 8gent.

## What is Ralph Mode?

Ralph Mode implements the "Ralph Wiggum" technique - a development methodology built around continuous AI agent loops. Named after the lovably persistent character from *The Simpsons*, this approach embraces iterative improvement over single-shot perfection.

### Core Concepts

1. **Deterministically malicking the array** - Control what goes into the context window
2. **One goal per iteration** - Avoid context rot by focusing on single objectives
3. **Specs as PIN** - Use specifications as a frame of reference
4. **Tests as checkpoints** - Verify before committing
5. **Low control, high oversight** - Let the agent decide what's important, but watch it

### Architecture

```
+------------------------------------------------------+
|                   Ralph Loop (outer)                  |
|  +------------------------------------------------+  |
|  |  AI SDK Tool Loop (inner)                      |  |
|  |  LLM <-> tools <-> LLM <-> tools ... until done |  |
|  +------------------------------------------------+  |
|                         |                            |
|  verifyCompletion: "Is the TASK actually complete?" |
|                         |                            |
|       No? -> Inject feedback -> Run another iteration |
|       Yes? -> Return final result                    |
+------------------------------------------------------+
```

## Usage

### Client-Side (Browser)

For immediate feedback with streaming UI:

```tsx
import { useRalphLoop } from '@/hooks/useRalphLoop';

function MyComponent() {
  const { status, start, stop } = useRalphLoop({
    maxIterations: 10,
    maxCost: 5.00,
    onIterationStart: ({ iteration }) => {
      console.log(`Starting iteration ${iteration}`);
    },
  });

  return (
    <div>
      <button onClick={() => start('Refactor the auth system')}>
        Start Ralph
      </button>
      <p>Iteration: {status.iteration}/{status.maxIterations}</p>
      <p>Status: {status.lastMessage}</p>
    </div>
  );
}
```

### Server-Side (Durable Jobs)

For operations that must survive browser close, use the Convex job system:

```typescript
// Create a durable Ralph job
const jobId = await createJob({
  jobType: 'ralph_search',
  appId: 'humans',
  sessionId,
  idempotencyKey: `ralph_${Date.now()}`,
  input: JSON.stringify({
    query: searchQuery,
    maxIterations: 4,
    targetStrongMatches: 5,
  }),
});

// Job runs server-side, survives browser close
// Check status in Activity center
```

## Stop Conditions

Ralph supports multiple ways to limit execution:

```typescript
import { iterationCountIs, tokenCountIs, costIs } from '@/lib/ralph';

// Stop after 10 iterations
stopWhen: iterationCountIs(10)

// Stop at 100k tokens
stopWhen: tokenCountIs(100_000)

// Stop at $5
stopWhen: costIs(5.00)

// Combine (stops when ANY condition is met)
stopWhen: [iterationCountIs(50), tokenCountIs(100_000), costIs(5.00)]
```

## Files

- `index.ts` - Main exports and configuration types
- `README.md` - This documentation

## Related

- `/src/hooks/useRalphLoop.ts` - React hook for client-side Ralph
- `/src/hooks/useDurableRalph.ts` - React hook for durable Ralph jobs
- `/convex/jobs.ts` - Server-side job processing
- `/src/app/activity/` - Job monitoring UI
