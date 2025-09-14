declare module '*.json' {
  const value: any;
  export default value;
}

declare module 'execa' {
  interface ExecaOptions {
    stdio?: 'pipe' | 'inherit' | 'ignore';
    cwd?: string;
  }
  
  function execa(command: string, args: string[], options?: ExecaOptions): Promise<any>;
  export = execa;
}

declare module 'ora' {
  interface Spinner {
    start(): Spinner;
    stop(): Spinner;
    succeed(text?: string): Spinner;
    fail(text?: string): Spinner;
  }
  
  function ora(text?: string): Spinner;
  export = ora;
}
