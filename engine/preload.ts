// `bun:bundle` is a compile-time-only virtual module from `bun build` that
// exposes `feature(name)` for declarative dead-code elimination. This app
// ships engine sources and runs them directly via `bun cli.tsx`, so the
// virtual module is not available — without this shim, every
// `import { feature } from 'bun:bundle'` throws "Cannot find package 'bundle'".
//
// All upstream feature flags gate optional / experimental functionality
// (KAIROS assistant, COORDINATOR_MODE, the standalone BRIDGE_MODE CLI
// command, voice mode, etc.). The desktop app's chat path doesn't rely on
// any of them, so the default is "off". Add a flag to ENABLED_FEATURES if
// it turns out to be load-bearing for this fork.
const ENABLED_FEATURES = new Set<string>();

import { plugin } from 'bun';

plugin({
  name: 'bun-bundle-runtime-shim',
  setup(build) {
    build.onResolve({ filter: /^bun:bundle$/ }, () => ({
      path: 'bun:bundle',
      namespace: 'bun-bundle-shim',
    }));
    build.onLoad({ filter: /.*/, namespace: 'bun-bundle-shim' }, () => ({
      contents: `const ENABLED = new Set(${JSON.stringify(Array.from(ENABLED_FEATURES))});
export const feature = (name) => ENABLED.has(name);
`,
      loader: 'ts',
    }));
  },
});

const version = process.env.CLAUDE_CODE_LOCAL_VERSION ?? '999.0.0-local';
const packageUrl = process.env.CLAUDE_CODE_LOCAL_PACKAGE_URL ?? 'claude-code-local';
const buildTime = process.env.CLAUDE_CODE_LOCAL_BUILD_TIME ?? new Date().toISOString();

process.env.CLAUDE_CODE_LOCAL_SKIP_REMOTE_PREFETCH ??= '1';

Object.assign(globalThis, {
  MACRO: {
    VERSION: version,
    PACKAGE_URL: packageUrl,
    NATIVE_PACKAGE_URL: packageUrl,
    BUILD_TIME: buildTime,
    FEEDBACK_CHANNEL: 'local',
    VERSION_CHANGELOG: '',
    ISSUES_EXPLAINER: '',
  },
});
