export function resolveStorageMode(config: {
  nodeEnv: string | undefined;
  databaseConfigured: boolean;
  demoEnabled: boolean;
}): 'postgres' | 'demo' | 'unconfigured' {
  if (config.databaseConfigured) return 'postgres';
  if (config.nodeEnv === 'development' && config.demoEnabled) return 'demo';
  return 'unconfigured';
}
