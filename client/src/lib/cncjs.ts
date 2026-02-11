/**
 * CNCjs Client Library
 *
 * Connects to CNCjs running on the workshop PC over local WiFi.
 * Provides WebSocket for real-time status and HTTP for file uploads/commands.
 *
 * CNCjs API docs: https://github.com/cncjs/cncjs/wiki/API-Reference
 */

export interface CNCjsConfig {
  host: string; // e.g., "192.168.1.100"
  port: number; // default 8000
  token?: string; // CNCjs access token (optional)
}

export interface MachineState {
  status: "Idle" | "Run" | "Hold" | "Alarm" | "Check" | "Door" | "Home" | "Sleep" | "Disconnected";
  mpos: { x: number; y: number; z?: number }; // machine position
  wpos: { x: number; y: number; z?: number }; // work position
  feedRate: number;
  spindleSpeed: number;
  progress: number; // 0-100 percent
  elapsedTime: number; // ms
  remainingTime: number; // ms
  linesTotal: number;
  linesCompleted: number;
}

export interface CNCjsPort {
  port: string;
  manufacturer?: string;
  inuse: boolean;
}

const DEFAULT_STATE: MachineState = {
  status: "Disconnected",
  mpos: { x: 0, y: 0 },
  wpos: { x: 0, y: 0 },
  feedRate: 0,
  spindleSpeed: 0,
  progress: 0,
  elapsedTime: 0,
  remainingTime: 0,
  linesTotal: 0,
  linesCompleted: 0,
};

type StatusListener = (state: MachineState) => void;
type ConnectionListener = (connected: boolean) => void;

export class CNCjsClient {
  private ws: WebSocket | null = null;
  private config: CNCjsConfig;
  private state: MachineState = { ...DEFAULT_STATE };
  private statusListeners: StatusListener[] = [];
  private connectionListeners: ConnectionListener[] = [];
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private _connected = false;
  private _serialConnected = false;
  private _currentPort = "";

  constructor(config: CNCjsConfig) {
    this.config = config;
  }

  get baseUrl(): string {
    return `http://${this.config.host}:${this.config.port}`;
  }

  get wsUrl(): string {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const token = this.config.token ? `?token=${this.config.token}` : "";
    return `${protocol}//${this.config.host}:${this.config.port}/ws${token}`;
  }

  get connected(): boolean {
    return this._connected;
  }

  get serialConnected(): boolean {
    return this._serialConnected;
  }

  get machineState(): MachineState {
    return { ...this.state };
  }

  // ---- Connection ----

  connect(): void {
    if (this.ws) {
      this.disconnect();
    }

    try {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        console.log("[CNCjs] WebSocket connected");
        this._connected = true;
        this.notifyConnection(true);
      };

      this.ws.onclose = () => {
        console.log("[CNCjs] WebSocket disconnected");
        this._connected = false;
        this._serialConnected = false;
        this.state = { ...DEFAULT_STATE };
        this.notifyConnection(false);
        this.notifyStatus();
        this.scheduleReconnect();
      };

      this.ws.onerror = (err) => {
        console.error("[CNCjs] WebSocket error:", err);
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };
    } catch (err) {
      console.error("[CNCjs] Connection failed:", err);
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.onclose = null; // prevent reconnect
      this.ws.close();
      this.ws = null;
    }
    this._connected = false;
    this._serialConnected = false;
    this.state = { ...DEFAULT_STATE };
    this.notifyConnection(false);
    this.notifyStatus();
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      console.log("[CNCjs] Attempting reconnect...");
      this.connect();
    }, 3000);
  }

  // ---- Message handling ----

  private handleMessage(raw: string): void {
    try {
      const msg = JSON.parse(raw);

      // CNCjs sends events as { type: "event_name", payload: {...} }
      // or Socket.IO format depending on version
      if (msg.type === "serialport:open" || msg.event === "serialport:open") {
        this._serialConnected = true;
        this._currentPort = msg.payload?.port || msg.data?.port || "";
        console.log("[CNCjs] Serial port opened:", this._currentPort);
      }

      if (msg.type === "serialport:close" || msg.event === "serialport:close") {
        this._serialConnected = false;
        this._currentPort = "";
        this.state.status = "Disconnected";
        this.notifyStatus();
      }

      // GRBL status report
      if (msg.type === "Grbl:state" || msg.event === "Grbl:state") {
        const data = msg.payload || msg.data || {};
        this.state.status = data.status?.activeState || this.state.status;
        if (data.status?.mpos) {
          this.state.mpos = data.status.mpos;
        }
        if (data.status?.wpos) {
          this.state.wpos = data.status.wpos;
        }
        if (data.status?.ov) {
          this.state.feedRate = data.status.ov[0] || 0;
        }
        this.notifyStatus();
      }

      // Sender status (file progress)
      if (msg.type === "sender:status" || msg.event === "sender:status") {
        const data = msg.payload || msg.data || {};
        this.state.linesTotal = data.total || 0;
        this.state.linesCompleted = data.sent || 0;
        this.state.elapsedTime = data.elapsedTime || 0;
        this.state.remainingTime = data.remainingTime || 0;
        if (data.total > 0) {
          this.state.progress = Math.round((data.sent / data.total) * 100);
        }
        this.notifyStatus();
      }

      // Workflow state changes
      if (msg.type === "workflow:state" || msg.event === "workflow:state") {
        const workflowState = msg.payload || msg.data;
        if (workflowState === "idle") {
          this.state.status = "Idle";
        } else if (workflowState === "running") {
          this.state.status = "Run";
        } else if (workflowState === "paused") {
          this.state.status = "Hold";
        }
        this.notifyStatus();
      }
    } catch {
      // Non-JSON message, ignore
    }
  }

  // ---- Commands ----

  private send(event: string, payload?: unknown): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn("[CNCjs] Cannot send, not connected");
      return;
    }
    this.ws.send(JSON.stringify({ type: event, payload }));
  }

  /** List available serial ports */
  async listPorts(): Promise<CNCjsPort[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/ports`, {
        headers: this.config.token ? { Authorization: `Bearer ${this.config.token}` } : {},
      });
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  }

  /** Open serial port to connect to GRBL controller */
  openPort(port: string, baudRate = 115200): void {
    this.send("open", { port, baudrate: baudRate, controllerType: "Grbl" });
  }

  /** Close serial port */
  closePort(): void {
    if (this._currentPort) {
      this.send("close", { port: this._currentPort });
    }
  }

  /** Upload and load G-code file content */
  async loadGCode(filename: string, gcode: string): Promise<boolean> {
    try {
      // Use CNCjs HTTP API to upload G-code
      const formData = new FormData();
      const blob = new Blob([gcode], { type: "text/plain" });
      formData.append("gcode", blob, filename);
      formData.append("port", this._currentPort);

      const res = await fetch(`${this.baseUrl}/api/gcode`, {
        method: "POST",
        headers: this.config.token ? { Authorization: `Bearer ${this.config.token}` } : {},
        body: formData,
      });

      if (!res.ok) {
        console.error("[CNCjs] Failed to upload G-code:", await res.text());
        return false;
      }

      console.log("[CNCjs] G-code loaded:", filename);
      return true;
    } catch (err) {
      console.error("[CNCjs] Upload error:", err);
      return false;
    }
  }

  /** Send raw G-code command */
  command(cmd: string): void {
    this.send("command", {
      port: this._currentPort,
      cmd: "gcode",
      args: [cmd],
    });
  }

  /** Start loaded G-code program */
  start(): void {
    this.send("command", {
      port: this._currentPort,
      cmd: "gcode:start",
    });
  }

  /** Pause running program */
  pause(): void {
    this.send("command", {
      port: this._currentPort,
      cmd: "gcode:pause",
    });
  }

  /** Resume paused program */
  resume(): void {
    this.send("command", {
      port: this._currentPort,
      cmd: "gcode:resume",
    });
  }

  /** Stop running program */
  stop(): void {
    this.send("command", {
      port: this._currentPort,
      cmd: "gcode:stop",
    });
  }

  /** Unload G-code */
  unload(): void {
    this.send("command", {
      port: this._currentPort,
      cmd: "gcode:unload",
    });
  }

  /** Home machine */
  home(): void {
    this.command("$H");
  }

  /** Unlock GRBL alarm */
  unlock(): void {
    this.command("$X");
  }

  /** Soft reset */
  reset(): void {
    this.send("command", {
      port: this._currentPort,
      cmd: "reset",
    });
  }

  /** Feed hold (immediate pause) */
  feedHold(): void {
    this.send("command", {
      port: this._currentPort,
      cmd: "feedhold",
    });
  }

  /** Cycle start / resume */
  cycleStart(): void {
    this.send("command", {
      port: this._currentPort,
      cmd: "cyclestart",
    });
  }

  // ---- Listeners ----

  onStatus(listener: StatusListener): () => void {
    this.statusListeners.push(listener);
    return () => {
      this.statusListeners = this.statusListeners.filter((l) => l !== listener);
    };
  }

  onConnection(listener: ConnectionListener): () => void {
    this.connectionListeners.push(listener);
    return () => {
      this.connectionListeners = this.connectionListeners.filter((l) => l !== listener);
    };
  }

  private notifyStatus(): void {
    const state = this.machineState;
    this.statusListeners.forEach((l) => l(state));
  }

  private notifyConnection(connected: boolean): void {
    this.connectionListeners.forEach((l) => l(connected));
  }
}

// Singleton — persists across page navigations
let _instance: CNCjsClient | null = null;

export function getCNCjsClient(): CNCjsClient | null {
  return _instance;
}

export function createCNCjsClient(config: CNCjsConfig): CNCjsClient {
  if (_instance) {
    _instance.disconnect();
  }
  _instance = new CNCjsClient(config);
  return _instance;
}

/** Load saved CNCjs connection settings from localStorage */
export function loadCNCjsSettings(): CNCjsConfig | null {
  try {
    const raw = localStorage.getItem("cncjs_config");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Save CNCjs connection settings to localStorage */
export function saveCNCjsSettings(config: CNCjsConfig): void {
  localStorage.setItem("cncjs_config", JSON.stringify(config));
}
