# Runtime Adapters

Adapters describe how the runtime layer talks to a model-serving platform.

For Cogochi v1, the supported target is `openclaw` with deterministic fallback.

The adapter must never become the only way to run the game.
If the adapter is unavailable, training and proof evaluation should still function through deterministic engine code.
