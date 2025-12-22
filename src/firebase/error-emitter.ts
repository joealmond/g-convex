export const errorEmitter = {
  emit: (error: any) => console.error(error),
  on: (_event: string, _cb: any) => {},
  off: (_event: string, _cb: any) => {}
};
