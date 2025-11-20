export type SSEClient = {
  write: (data: string) => void;
  close: () => void;
};

export class SSEManager {
  private clients: SSEClient[] = [];

  addClient(client: SSEClient) {
    this.clients.push(client);
  }

  removeClient(client: SSEClient) {
    const idx = this.clients.indexOf(client);
    if (idx !== -1) this.clients.splice(idx, 1);
  }

  broadcast(data: unknown) {
    const payload = `data: ${JSON.stringify(data)}\n\n`;
    this.clients.forEach((client) => {
      client.write(payload);
    });
  }
}
