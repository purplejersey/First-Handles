// Saved profile + progress, kept in this browser only (no sync in v1).
// Completions are recorded per step so rewards can attach to them later.

import { LEVELS } from "./data/levels.js";

const KEY = "firstHandles.v1";

function blank() {
  return { profile: null, completions: {} };
}

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blank();
    const parsed = JSON.parse(raw);
    return { ...blank(), ...parsed, completions: parsed.completions || {} };
  } catch {
    return blank();
  }
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked: the app keeps working for this visit.
  }
}

// ---------- profile ----------
export function getProfile() {
  return state.profile;
}

export function setProfile(profile) {
  state.profile = profile;
  save();
}

// ---------- lookups ----------
export function getLevel(levelId) {
  return LEVELS.find((l) => l.id === Number(levelId)) || null;
}

export function findStep(stepId) {
  for (const level of LEVELS) {
    const index = level.steps.findIndex((s) => s.id === stepId);
    if (index !== -1) return { level, step: level.steps[index], index };
  }
  return null;
}

// ---------- status ----------
export function isStepDone(stepId) {
  return Boolean(state.completions[stepId]);
}

export function isLevelComplete(level) {
  return level.steps.length > 0 && level.steps.every((s) => isStepDone(s.id));
}

export function isLevelUnlocked(level) {
  const index = LEVELS.indexOf(level);
  if (index <= 0) return true;
  return isLevelComplete(LEVELS[index - 1]);
}

export function isStepUnlocked(stepId) {
  const found = findStep(stepId);
  if (!found || !isLevelUnlocked(found.level)) return false;
  if (found.index === 0) return true;
  return isStepDone(found.level.steps[found.index - 1].id);
}

// ---------- the single "step complete" signal ----------
// Everything that finishes a step (Done button now, camera counting later)
// calls this one function. Listeners can react via the "stepcomplete" event.
export function completeStep(stepId) {
  const found = findStep(stepId);
  if (!found) return null;
  const wasLevelComplete = isLevelComplete(found.level);
  const now = new Date().toISOString();
  const prev = state.completions[stepId];
  state.completions[stepId] = {
    count: (prev?.count || 0) + 1,
    firstAt: prev?.firstAt || now,
    lastAt: now,
  };
  save();
  const result = {
    stepId,
    level: found.level,
    firstTime: !prev,
    levelJustCompleted: !wasLevelComplete && isLevelComplete(found.level),
    isLastStep: found.index === found.level.steps.length - 1,
  };
  window.dispatchEvent(new CustomEvent("stepcomplete", { detail: result }));
  return result;
}

// For testing on devices. Parent controls come later.
export function resetProgress() {
  state.completions = {};
  save();
}
