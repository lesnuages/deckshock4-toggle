import { ButtonItem, PanelSection, PanelSectionRow, ToggleField, staticClasses } from "@decky/ui";
import { callable, definePlugin, toaster } from "@decky/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaBolt } from "react-icons/fa";

type CommandResult = {
  ok: boolean;
  stdout: string;
  stderr: string;
  returncode: number;
  command: string[];
};

type ServiceStatus = {
  id: string;
  description: string;
  active_state: string;
  sub_state: string;
  unit_file_state: string;
  load_state: string;
  running: boolean;
  enabled: boolean;
};

type StatusResponse = {
  ok: boolean;
  status?: ServiceStatus;
  error?: string;
};

const getStatus = callable<[], StatusResponse>("get_status");
const startService = callable<[], CommandResult>("start_service");
const stopService = callable<[], CommandResult>("stop_service");
const restartService = callable<[], CommandResult>("restart_service");
const enableService = callable<[], CommandResult>("enable_service");
const disableService = callable<[], CommandResult>("disable_service");

//const SERVICE_TITLE = "DeckShock4 systemd service";

function Content() {
  const [status, setStatus] = useState<ServiceStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<boolean>(false);
  const [busyAction, setBusyAction] = useState<boolean>(false);

  const toast = useCallback((body: string) => {
    toaster.toast({
      title: "DeckShock4 Toggle",
      body,
    });
  }, []);

  const refreshStatus = useCallback(async () => {
    setLoadingStatus(true);
    try {
      const response = await getStatus();
      if (response?.ok && response.status) {
        setStatus(response.status);
        setError(null);
      } else {
        const message = response?.error ?? "Unable to fetch DeckShock4 status.";
        setError(message);
        setStatus(null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      setStatus(null);
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  const handleAction = useCallback(
    async (label: string, action: () => Promise<CommandResult>, successMessage: string) => {
      setBusyAction(true);
      try {
        const result = await action();
        if (result.ok) {
          toast(successMessage);
          await refreshStatus();
        } else {
          const message = result.stderr || result.stdout || `Failed to ${label}.`;
          setError(message);
          toast(message);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : `Failed to ${label}.`;
        setError(message);
        toast(message);
      } finally {
        setBusyAction(false);
      }
    },
    [refreshStatus, toast],
  );

  const statusSummary = useMemo(() => {
    if (!status) {
      return loadingStatus ? "Loading…" : "Unknown";
    }
    return `${status.active_state}/${status.sub_state}`;
  }, [status, loadingStatus]);

  return (
    <PanelSection title="Service status">
      <PanelSectionRow>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div>Status: {statusSummary}</div>
          <div>Start on boot: {status?.enabled ? "Yes" : "No"}</div>
          {error && <div style={{ color: "var(--warning)" }}>{error}</div>}
        </div>
      </PanelSectionRow>

      <PanelSectionRow>
        <ButtonItem
          layout="below"
          disabled={loadingStatus || busyAction}
          onClick={() => void refreshStatus()}
        >
          {loadingStatus ? "Refreshing…" : "Refresh status"}
        </ButtonItem>
      </PanelSectionRow>

      <PanelSectionRow>
        <ToggleField
          layout="inline"
          label="Service running"
          description="Start or stop the DeckShock4 service."
          disabled={busyAction || loadingStatus || !status}
          checked={status?.running ?? false}
          onChange={(checked) => {
            if (!status || status.running === checked) {
              return;
            }
            if (checked) {
              void handleAction(
                "start DeckShock4",
                startService,
                "DeckShock4 service started.",
              );
            } else {
              void handleAction(
                "stop DeckShock4",
                stopService,
                "DeckShock4 service stopped.",
              );
            }
          }}
        />
      </PanelSectionRow>

      <PanelSectionRow>
        <ToggleField
          layout="inline"
          label="Enable at boot"
          description="Enable or disable DeckShock4 on startup."
          disabled={busyAction || loadingStatus || !status}
          checked={status?.enabled ?? false}
          onChange={(checked) => {
            if (!status || status.enabled === checked) {
              return;
            }
            if (checked) {
              void handleAction(
                "enable DeckShock4",
                enableService,
                "DeckShock4 service enabled at boot.",
              );
            } else {
              void handleAction(
                "disable DeckShock4",
                disableService,
                "DeckShock4 service disabled at boot.",
              );
            }
          }}
        />
      </PanelSectionRow>

      <PanelSectionRow>
        <ButtonItem
          layout="below"
          disabled={busyAction || loadingStatus}
          onClick={() =>
            void handleAction(
              "restart DeckShock4",
              restartService,
              "DeckShock4 service restarted.",
            )
          }
        >
          Restart DeckShock4
        </ButtonItem>
      </PanelSectionRow>

    </PanelSection>
  );
}

export default definePlugin(() => {
  console.log("DeckShock4 Toggle frontend initialized.");

  return {
    name: "DeckShock4 Toggle",
    titleView: <div className={staticClasses.Title}>DeckShock4</div>,
    content: <Content />,
    icon: <FaBolt />,
    onDismount() {
      console.log("DeckShock4 Toggle frontend unmounted.");
    },
  };
});
