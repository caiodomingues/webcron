export class CallbackService {
  handleCallback(body: unknown): { message: string; body: unknown } {
    return {
      message: "Callback received",
      body,
    };
  }
}
