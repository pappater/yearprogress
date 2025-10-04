// milestones.js - Milestone logic and localStorage fallback
import { loadMilestonesFromGist, saveMilestonesToGist } from "./gist.js";

export let milestones = [];

export function saveMilestonesLocal() {
  localStorage.setItem("milestones", JSON.stringify(milestones));
}
export function loadMilestonesLocal() {
  const data = localStorage.getItem("milestones");
  if (data) milestones = JSON.parse(data);
}

function getCurrentToken() {
  return localStorage.getItem("githubToken");
}

export async function loadMilestones() {
  let tokenLoad = getCurrentToken();
  if (tokenLoad) {
    const loaded = await loadMilestonesFromGist(tokenLoad);
    milestones.length = 0;
    milestones.push(...loaded);
    saveMilestonesLocal();
  } else {
    loadMilestonesLocal();
  }
}

export async function saveMilestones() {
  let tokenSave = getCurrentToken();
  if (tokenSave) {
    await saveMilestonesToGist(tokenSave, milestones);
    saveMilestonesLocal();
  } else {
    saveMilestonesLocal();
  }
}

export async function addMilestone(date, label) {
  if (!date) return;
  milestones.push({ date, label });
  await saveMilestones();
}
