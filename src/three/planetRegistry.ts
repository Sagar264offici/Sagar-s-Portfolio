import * as THREE from "three";

const positions = new Map<string, THREE.Vector3>();

export function registerPlanetPosition(key: string, pos: THREE.Vector3): void {
  positions.set(key, pos);
}

export function unregisterPlanetPosition(key: string): void {
  positions.delete(key);
}

export function getPlanetPosition(key: string): THREE.Vector3 | undefined {
  return positions.get(key);
}

/* ── Shared orbital state (single source of truth) ────────
   Each Planet writes its angle here every frame; the OrbitCollider
   reads and nudges the same objects so planets can never overlap. */
export interface OrbitState {
  key: string;
  angle: number;
  ring: number;
  size: number;
}

const orbits = new Map<string, OrbitState>();

export function registerOrbit(key: string, state: OrbitState): void {
  orbits.set(key, state);
}

export function unregisterOrbit(key: string): void {
  orbits.delete(key);
}

export function getOrbitState(key: string): OrbitState | undefined {
  return orbits.get(key);
}

export function getOrbitStates(): OrbitState[] {
  return Array.from(orbits.values());
}
