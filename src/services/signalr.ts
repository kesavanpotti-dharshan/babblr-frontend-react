import { HubConnection, HubConnectionBuilder, LogLevel, HttpTransportType, HubConnectionState } from '@microsoft/signalr';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5174';

class SignalRService {
  private connection: HubConnection | null = null;
  private token: string | null = null;

  private transportRetries = 0;

  async startConnection(token: string) {
    if (this.connection) {
      if (this.connection.state === HubConnectionState.Connected) return;
      await this.stopConnection();
    }

    this.token = token;
    
    // If we've had multiple failures, try forcing Long Polling
    const transport = this.transportRetries > 2 
      ? HttpTransportType.LongPolling 
      : HttpTransportType.WebSockets | HttpTransportType.LongPolling;

    if (this.transportRetries > 2) {
      console.warn('SignalR: Forcing Long Polling due to repeated connection issues.');
    }

    this.connection = new HubConnectionBuilder()
      .withUrl(`${API_URL}/hubs/chat`, {
        accessTokenFactory: () => this.token || '',
        skipNegotiation: false,
        transport: transport
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: retryContext => {
          // Reconnect more aggressively at first
          if (retryContext.elapsedMilliseconds < 30000) {
            return 1000;
          } else if (retryContext.elapsedMilliseconds < 120000) {
            return 5000;
          } else {
            return 30000;
          }
        }
      })
      .configureLogging(LogLevel.Warning) // Reduce noise but keep warnings/errors
      .build();

    // Re-attach all registered handlers to the new connection
    Object.keys(this.handlers).forEach(eventName => {
      this.connection?.on(eventName, (...args: any[]) => {
        this.handlers[eventName].forEach(handler => handler(...args));
      });
    });

    // Adjust timeouts to be more aggressive with keep-alives to prevent proxy timeouts
    this.connection.serverTimeoutInMilliseconds = 30000; // 30 seconds
    this.connection.keepAliveIntervalInMilliseconds = 10000; // 10 seconds

    this.connection.onclose((error) => {
      console.error('SignalR Connection closed: ', error);
      if (error) {
        this.transportRetries++;
      }
      if (this.token) {
        console.log('Attempting to restart SignalR connection...');
        setTimeout(() => this.startConnection(this.token!), 5000);
      }
    });

    this.connection.onreconnecting((error) => {
      console.warn('SignalR Connection reconnecting: ', error);
    });

    this.connection.onreconnected((connectionId) => {
      console.log('SignalR Connection reconnected. ID: ', connectionId);
    });

    try {
      await this.connection.start();
      console.log('SignalR Connected');
      this.transportRetries = 0; // Reset on success
    } catch (err) {
      console.error('SignalR Connection Error: ', err);
      this.transportRetries++; // Increment on failure
      if (this.token) {
        setTimeout(() => this.startConnection(this.token!), 5000);
      }
    }
  }

  async stopConnection() {
    this.token = null;
    if (this.connection) {
      try {
        await this.connection.stop();
      } catch (err) {
        console.error('Error stopping SignalR connection: ', err);
      }
      this.connection = null;
      console.log('SignalR Disconnected');
    }
  }

  private handlers: Record<string, ((...args: any[]) => void)[]> = {};

  on(eventName: string, callback: (...args: any[]) => void) {
    if (!this.handlers[eventName]) {
      this.handlers[eventName] = [];
      // Only register the actual SignalR listener once
      this.connection?.on(eventName, (...args: any[]) => {
        this.handlers[eventName].forEach(handler => handler(...args));
      });
    }
    this.handlers[eventName].push(callback);
  }

  off(eventName: string, callback?: (...args: any[]) => void) {
    if (!this.handlers[eventName]) return;

    if (callback) {
      this.handlers[eventName] = this.handlers[eventName].filter(h => h !== callback);
    } else {
      this.handlers[eventName] = [];
    }

    // If no more handlers, we could potentially call this.connection.off(eventName)
    // but it's safer to just keep the wrapper and let it call an empty array
    if (this.handlers[eventName].length === 0) {
      this.connection?.off(eventName);
      delete this.handlers[eventName];
    }
  }

  async invoke(methodName: string, ...args: any[]) {
    // If not connected, wait up to 5 seconds
    if (!this.connection || this.connection.state !== HubConnectionState.Connected) {
      console.log(`SignalR not connected (State: ${this.connection?.state}), waiting for connection to invoke ${methodName}...`);
      let attempts = 0;
      while ((!this.connection || this.connection.state !== HubConnectionState.Connected) && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
      }
    }

    if (this.connection && this.connection.state === HubConnectionState.Connected) {
      try {
        return await this.connection.invoke(methodName, ...args);
      } catch (err) {
        console.error(`Error invoking ${methodName}: `, err);
        throw err;
      }
    }
    console.warn(`SignalR not connected (State: ${this.connection?.state}). Cannot invoke ${methodName}`);
  }

  getConnectionState() {
    return this.connection?.state;
  }
}

export const signalRService = new SignalRService();
