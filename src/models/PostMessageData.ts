export interface PostMessageData {
  command: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any;
  requestId?: string;
}
