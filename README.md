# DeckShock4 Toggle

DeckShock4 Toggle is a Decky plugin that lets you monitor and control the native `deckshock4` systemd service on a Steam Deck. Use it to quickly start, stop, restart, or toggle the service's boot behaviour without leaving Game Mode.

## Features

- View the current state of the `deckshock4` service (active/running and enabled/disabled).
- Start, stop, and restart the service directly from the Decky sidebar.
- Enable or disable the service so it runs at boot.
- Works with both user and system instances of `deckshock4.service` (the plugin automatically tries `systemctl --user` first, then falls back to `systemctl`).

## Building

Prerequisites:

- Node.js v16.14 or later.
- `pnpm` v9 (`npm i -g pnpm@9`).

Install dependencies and build the frontend bundle:

```bash
pnpm install
pnpm run build
```

The generated bundle will be placed in the `dist/` directory. Deploy it to your Steam Deck using your preferred Decky deployment workflow.

## Development Notes

- Backend logic lives in `main.py` and exposes callable helpers for the frontend through Decky's RPC bridge.
- Frontend UI is implemented in `src/index.tsx` using `@decky/ui` components.
- When iterating on the frontend, re-run `pnpm run build` (or `pnpm run watch`) and redeploy the resulting bundle.

## License

This project retains the BSD-3-Clause license from the original Decky plugin template. See [LICENSE](LICENSE) for details.
