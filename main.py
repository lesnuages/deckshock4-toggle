import asyncio
from asyncio.subprocess import PIPE
import os
from typing import Dict, List, Optional, Tuple

import decky


SERVICE_UNIT = "deckshock4.service"
SHOW_PROPERTIES: Tuple[str, ...] = (
    "Id",
    "LoadState",
    "ActiveState",
    "SubState",
    "UnitFileState",
    "Description",
)


def _decode(stream: bytes) -> str:
    return stream.decode("utf-8", errors="replace").strip()


def _is_enabled(unit_file_state: Optional[str]) -> bool:
    return unit_file_state in ("enabled", "enabled-runtime")


def _should_fallback_to_system(stderr: str) -> bool:
    lowered = stderr.lower()
    service = SERVICE_UNIT.lower()
    if not lowered:
        return False
    if service in lowered and (
        "could not be found" in lowered
        or "not found" in lowered
        or "unknown unit" in lowered
        or ("unit file" in lowered and "does not exist" in lowered)
        or "no such file or directory" in lowered
    ):
        return True
    if "failed to connect to bus" in lowered:
        return True
    return False


class Plugin:
    async def _run_systemctl(self, *args: str) -> Dict[str, object]:
        commands: List[Tuple[List[str], bool]] = [
            (["systemctl", "--user", *args], True),
            (["systemctl", *args], False),
        ]

        last_result: Optional[Dict[str, object]] = None
        env = os.environ.copy()
        removed_env_vars: List[str] = []
        for var in ("LD_LIBRARY_PATH", "PYTHONHOME", "PYTHONPATH"):
            if var in env:
                env.pop(var)
                removed_env_vars.append(var)

        if removed_env_vars:
            decky.logger.debug(
                "Sanitized environment for systemctl (removed %s variables)",
                ", ".join(removed_env_vars),
            )

        for command, allow_fallback in commands:
            decky.logger.debug("Executing command: %s", " ".join(command))
            process = await asyncio.create_subprocess_exec(
                *command,
                stdout=PIPE,
                stderr=PIPE,
                env=env,
            )
            stdout, stderr = await process.communicate()

            result = {
                "ok": process.returncode == 0,
                "stdout": _decode(stdout),
                "stderr": _decode(stderr),
                "returncode": process.returncode,
                "command": command,
            }

            if result["ok"]:
                return result

            last_result = result
            decky.logger.warning(
                "systemctl command failed (rc=%s): %s | stderr=%s",
                process.returncode,
                " ".join(command),
                result["stderr"],
            )
            if not allow_fallback:
                break
            if not _should_fallback_to_system(result["stderr"]):
                break

        return last_result or {
            "ok": False,
            "stdout": "",
            "stderr": "systemctl command failed",
            "returncode": -1,
            "command": commands[-1],
        }

    async def _service_action(self, action: str) -> Dict[str, object]:
        result = await self._run_systemctl(action, SERVICE_UNIT)
        if result["ok"]:
            decky.logger.info("Successfully executed %s for %s", action, SERVICE_UNIT)
        else:
            decky.logger.error(
                "Failed to execute %s for %s: %s",
                action,
                SERVICE_UNIT,
                result["stderr"],
            )
        return result

    async def get_status(self) -> Dict[str, object]:
        args = ["show", SERVICE_UNIT]
        for prop in SHOW_PROPERTIES:
            args.append(f"--property={prop}")

        result = await self._run_systemctl(*args)
        if not result["ok"]:
            return {
                "ok": False,
                "error": result["stderr"] or "Unable to read service status",
            }

        status: Dict[str, str] = {}
        for line in result["stdout"].splitlines():
            if "=" not in line:
                continue
            key, value = line.split("=", 1)
            status[key] = value

        active_state = status.get("ActiveState", "unknown")
        sub_state = status.get("SubState", "unknown")
        unit_file_state = status.get("UnitFileState", "unknown")

        formatted = {
            "ok": True,
            "status": {
                "id": status.get("Id", SERVICE_UNIT),
                "description": status.get("Description", "DeckShock4 service"),
                "active_state": active_state,
                "sub_state": sub_state,
                "unit_file_state": unit_file_state,
                "load_state": status.get("LoadState", "unknown"),
                "running": active_state == "active" and sub_state == "running",
                "enabled": _is_enabled(unit_file_state),
            },
        }

        return formatted

    async def start_service(self) -> Dict[str, object]:
        return await self._service_action("start")

    async def stop_service(self) -> Dict[str, object]:
        return await self._service_action("stop")

    async def restart_service(self) -> Dict[str, object]:
        return await self._service_action("restart")

    async def enable_service(self) -> Dict[str, object]:
        return await self._service_action("enable")

    async def disable_service(self) -> Dict[str, object]:
        return await self._service_action("disable")

    async def _main(self):
        decky.logger.info("DeckShock4 Toggle backend ready.")

    async def _unload(self):
        decky.logger.info("DeckShock4 Toggle backend unloading.")

    async def _uninstall(self):
        decky.logger.info("DeckShock4 Toggle backend uninstalled.")

    # Migrations that should be performed before entering `_main()`.
    async def _migration(self):
        decky.logger.info("DeckShock4 Toggle migration (legacy template cleanup).")
        decky.migrate_logs(os.path.join(decky.DECKY_USER_HOME,
                                        ".config", "decky-template", "template.log"))
        decky.migrate_settings(
            os.path.join(decky.DECKY_HOME, "settings", "template.json"),
            os.path.join(decky.DECKY_USER_HOME, ".config", "decky-template"))
        decky.migrate_runtime(
            os.path.join(decky.DECKY_HOME, "template"),
            os.path.join(decky.DECKY_USER_HOME, ".local", "share", "decky-template"))
