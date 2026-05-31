import { createHash } from 'crypto';
import type { ComponentContract } from './contracts';

export function componentFingerprint(contract: ComponentContract): string {
  const stable = JSON.stringify(contract, Object.keys(contract).sort());
  return createHash('sha256').update(stable).digest('hex').slice(0, 16);
}

export function registryFingerprint(contracts: ComponentContract[]): Record<string, string> {
  return Object.fromEntries(contracts.map((contract) => [contract.name, componentFingerprint(contract)]));
}
