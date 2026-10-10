# TS Raycaster

The repository contains two separate npm projects:

- `src/libs/pt_engine/` is the separate `@tsraycaster/pt-engine` TypeScript
  library project. It builds an ESM bundle and declaration files into
  `src/libs/pt_engine/dist/`.
- The repository root is the React editor. Its worker consumes the built engine
  package and is bundled with the editor into `dist/editor/`.

Install dependencies from the repository root:

```sh
npm install
```

Build the engine package first, then build the editor:

```sh
npm run build --workspace @tsraycaster/pt-engine
npm run build
```

The editor build intentionally does not build the engine. Rebuild the engine
after changing its source before building or running the editor. To consume the
engine from another project, publish or pack the `@tsraycaster/pt-engine`
package after building it.
