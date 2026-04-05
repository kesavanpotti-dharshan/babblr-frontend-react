import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5174';

class SignalRService {
  private connection: HubConnection | null = null;

  async startConnection(token: string) {
    if (this.connection) return;

    this.connection = new HubConnectionBuilder()
      .withUrl(`${API_URL}/hubs/chat?access_token=${token}`)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    try {
      await this.connection.start();
      console.log('SignalR Connected');
    } catch (err) {
      console.error('SignalR Connection Error: ', err);
      setTimeout(() => this.startConnection(token), 5000);
    }
  }

  async stopConnection() {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
      console.log('SignalR Disconnected');
    }
  }

  on(eventName: string, callback: (...args: any[]) => void) {
    this.connection?.on(eventName, callback);
  }

  off(eventName: string) {
    this.connection?.off(eventName);
  }

  async invoke(methodName: string, ...args: any[]) {
    if (this.connection?.state === 'Connected') {
      return this.connection.invoke(methodName, ...args);
    }
    console.warn(`SignalR not connected. Cannot invoke ${methodName}`);
  }

  getConnectionState() {
    return this.connection?.state;
  }
}

export const signalRService = new SignalRService();
