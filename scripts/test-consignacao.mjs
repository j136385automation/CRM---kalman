// Register all domain and document tests in the same Node process.
// This also works with Node releases whose test discovery treats TS files as opaque entries.
import '../src/features/consignacao/tests/negociacao.test.ts';
import '../src/features/contratos/tests/templates.test.ts';
import '../src/features/contratos/tests/export.test.ts';
