"""Local add-on launcher with a Psycopg-compatible Windows event loop."""

import asyncio
import sys
from pathlib import Path

import uvicorn
from dotenv import load_dotenv


def main() -> None:
    # Reuse the private local trigger settings without changing the API .env.
    load_dotenv(Path(__file__).resolve().parents[1] / ".env.sitemap.local")
    server = uvicorn.Server(
        uvicorn.Config("app.sitemap_main:app", host="127.0.0.1", port=8000)
    )
    # Psycopg's asynchronous driver requires a selector loop on Windows.
    loop_factory = asyncio.SelectorEventLoop if sys.platform == "win32" else asyncio.new_event_loop
    with asyncio.Runner(loop_factory=loop_factory) as runner:
        runner.run(server.serve())


if __name__ == "__main__":
    main()
