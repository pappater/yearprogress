// Handles milestone data: add, edit, delete, get, and storage
// Exports: getMilestones, addMilestone, editMilestone, deleteMilestone, setMilestoneCustomization

import { loadMilestonesFromGist, saveMilestonesToGist } from "./gist.js";

// All milestone operations are now Gist-only

async function getMilestones() {
  const token = localStorage.getItem("githubToken");
  if (!token) return [];
  const milestones = await loadMilestonesFromGist(token);
  console.log("Loaded milestones from Gist:", milestones);
  // Ensure all milestones have an id
  let changed = false;
  milestones.forEach((m) => {
    if (!m.id) {
      m.id = Date.now().toString(36) + Math.random().toString(36).slice(2);
      changed = true;
    }
  });
  if (changed) {
    await saveMilestones(milestones);
  }
  return milestones;
}

async function saveMilestones(milestones) {
  const token = localStorage.getItem("githubToken");
  if (!token) throw new Error("Not logged in");
  try {
    console.log("Saving milestones to Gist:", milestones);
    await saveMilestonesToGist(token, milestones);
  } catch (err) {
    alert("Failed to save milestones to Gist: " + (err?.message || err));
    throw err;
  }
}

async function addMilestone(milestone) {
  const milestones = await getMilestones();
  // Ensure unique id
  if (!milestone.id) {
    milestone.id =
      Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
  milestones.push(milestone);
  await saveMilestones(milestones);
}

async function editMilestone(id, updates) {
  const milestones = await getMilestones();
  const updated = milestones.map((m) =>
    m.id === id ? { ...m, ...updates } : m
  );
  await saveMilestones(updated);
}

async function deleteMilestone(id) {
  const milestones = await getMilestones();
  const filtered = milestones.filter((m) => m.id !== id);
  await saveMilestones(filtered);
}

async function setMilestoneCustomization(id, customization) {
  await editMilestone(id, { customization });
}

export {
  getMilestones,
  addMilestone,
  editMilestone,
  deleteMilestone,
  setMilestoneCustomization,
};
