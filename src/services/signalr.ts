import { HubConnection, HubConnectionBuilder, LogLevel, HttpTransportType, HubConnectionState } from '@microsoft/signalr';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5174';

class SignalRService {
  private connection: HubConnection | null = null;
  private token: string | null = null;

  async startConnection(token: string) {
    if (this.connection) {
      if (this.connection.state === HubConnectionState.Connected) return;
      await this.stopConnection();
    }

    this.token = token;
    this.connection = new HubConnectionBuilder()
      .withUrl(`${API_URL}/hubs/chat`, {
        accessTokenFactory: () => this.token || '',
        skipNegotiation: false,
        transport: HttpTransportType.WebSockets | HttpTransportType.LongPolling
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: retryContext => {
          if (retryContext.elapsedMilliseconds < 60000) {
            return 2000;
          } else {
            return 10000;
          }
        }
      })
      .configureLogging(LogLevel.Information)
      .build();

    // Increase timeouts to be more resilient to network jitter
    this.connection.serverTimeoutInMilliseconds = 60000; // 60 seconds (default is 30)
    this.connection.keepAliveIntervalInMilliseconds = 15000; // 15 seconds (default is 15)

    this.connection.onclose((error) => {
      console.error('SignalR Connection closed: ', error);
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
    } catch (err) {
      console.error('SignalR Connection Error: ', err);
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

  on(eventName: string, callback: (...args: any[]) => void) {
    if (!this.connection) {
      console.warn(`Cannot register listener for ${eventName}: connection not initialized`);
      return;
    }
    this.connection.on(eventName, callback);
  }

  off(eventName: string) {
    this.connection?.off(eventName);
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
