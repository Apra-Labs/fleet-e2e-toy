CHANGES NEEDED

## Findings

### HIGH
- **Linter Failure:** Running `npm run lint` fails with exit code 1 due to an unused variable error in `src/cli.ts` (line 34): `error 'err' is defined but never used @typescript-eslint/no-unused-vars`. The catch block should either omit the variable (i.e. `catch`) or prefix it with an underscore (i.e. `_err`).

### MEDIUM
- None

### LOW
- None
