/**
 * Public surface of the seed layer. ONLY `src/repositories/mock` (and tests) may import this.
 * ESLint forbids it from app/, features/, components/ and hooks/.
 */
export { prototypeDatasetSchema, type PrototypeDataset } from './dataset';
export {
  buildSeedDataset,
  clearPersistedPrototypeData,
  datasetFingerprint,
  type SeedOptions,
} from './resetSeed';
