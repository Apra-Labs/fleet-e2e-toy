interface SigintDeps {
  cleanup: () => void;
  write: (s: string) => void;
  exit: (code: number) => void;
}

export function createSigintHandler(deps: SigintDeps): () => void {
  return () => {
    deps.cleanup();
    deps.write("Interrupted.\n");
    deps.exit(130);
  };
}
