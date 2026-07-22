import { join } from "node:path";

export interface MosadProfile {
  employerId: string;
  employerName: string;
  codeMosad: string;
  codeMosadSubject: string;
  updatedAt: string;
}

export interface MosadProfileInput {
  employerId: string;
  employerName: string;
  codeMosad: string;
  codeMosadSubject: string;
}

export interface MosadStore {
  [employerId: string]: MosadProfile;
}

const STORE_FILE = join(import.meta.dir, "../../data/mosad-profiles.json");

export async function loadMosadStore(): Promise<MosadStore> {
  const file = Bun.file(STORE_FILE);
  if (await file.exists()) {
    try {
      return await file.json();
    } catch {
      return {};
    }
  }
  return {};
}

export async function saveMosadStore(store: MosadStore): Promise<void> {
  // Ensure data directory exists
  const dataDir = join(import.meta.dir, "../../data");
  const gitkeep = Bun.file(join(dataDir, ".gitkeep"));
  if (!(await gitkeep.exists())) {
    await Bun.write(join(dataDir, ".gitkeep"), "");
  }
  await Bun.write(STORE_FILE, JSON.stringify(store, null, 2));
}

export async function getMosadProfile(employerId: string): Promise<MosadProfile | undefined> {
  const store = await loadMosadStore();
  return store[employerId];
}

export async function saveMosadProfile(profile: MosadProfileInput): Promise<void> {
  const store = await loadMosadStore();
  store[profile.employerId] = {
    ...profile,
    updatedAt: new Date().toISOString(),
  };
  await saveMosadStore(store);
}

export async function getAllMosadProfiles(): Promise<MosadProfile[]> {
  const store = await loadMosadStore();
  return Object.values(store).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function deleteMosadProfile(employerId: string): Promise<boolean> {
  const store = await loadMosadStore();
  if (store[employerId]) {
    delete store[employerId];
    await saveMosadStore(store);
    return true;
  }
  return false;
}

export async function updateMosadProfile(
  employerId: string,
  profile: Omit<MosadProfileInput, "employerId">
): Promise<boolean> {
  const store = await loadMosadStore();
  if (!store[employerId]) {
    return false;
  }

  store[employerId] = {
    employerId,
    ...profile,
    updatedAt: new Date().toISOString(),
  };

  await saveMosadStore(store);
  return true;
}
