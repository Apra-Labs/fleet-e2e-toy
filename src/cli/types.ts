export interface CliArgs {
  subcommand: string;
  flags: {
    id?: string;
    title?: string;
    content?: string;
    tag?: string;
    q?: string;
    help?: boolean;
    version?: boolean;
    h?: boolean;
    v?: boolean;
  };
}
