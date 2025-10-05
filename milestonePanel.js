// UI for the right-side milestone management panel
// Exports: openMilestonePanel, closeMilestonePanel, renderMilestonePanel
import {
  getMilestones,
  editMilestone,
  deleteMilestone,
  setMilestoneCustomization,
} from "./milestoneData.js";

function openMilestonePanel() {
  document.getElementById("milestone-panel").style.right = "0";
}

function closeMilestonePanel() {
  document.getElementById("milestone-panel").style.right = "-400px";
}

async function renderMilestonePanel() {
  const panel = document.getElementById("milestone-panel-content");
  const milestones = await getMilestones();
  panel.innerHTML = "";
  if (milestones.length === 0) {
    panel.innerHTML = '<div class="empty">No milestones yet.</div>';
    return;
  }
  milestones.forEach((m) => {
    const item = document.createElement("div");
    item.className = "milestone-item";
    item.innerHTML = `
      <div class="milestone-label" style="color: ${
        m.customization?.color || "#00cec9"
      }">
        <span>${m.label || "(No label)"}</span>
        <span class="milestone-date">${m.date} ${m.time || ""}</span>
      </div>
      <button class="edit-btn" data-id="${m.id}">Edit</button>
      <button class="delete-btn" data-id="${m.id}">Delete</button>
    `;
    panel.appendChild(item);
  });
  // Attach event listeners for edit/delete
  panel.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.onclick = async (e) => {
      const id = btn.getAttribute("data-id");
      const milestones = await getMilestones();
      const m = milestones.find((m) => m.id === id);
      if (!m) return;
      const newLabel = prompt("Edit label:", m.label || "");
      const newDate = prompt("Edit date (YYYY-MM-DD):", m.date || "");
      const newTime = prompt("Edit time (HH:MM):", m.time || "");
      const newColor = prompt(
        "Edit color (hex or name):",
        m.customization?.color || "#00cec9"
      );
      const newIcon = prompt("Edit icon (emoji):", m.customization?.icon || "");
      if (window.showLoader) window.showLoader(true);
      btn.disabled = true;
      try {
        await editMilestone(id, {
          label: newLabel,
          date: newDate,
          time: newTime,
          customization: { color: newColor, icon: newIcon },
        });
        await renderMilestonePanel();
        // Reload milestones from Gist and update UI
        if (window.updateUI) {
          const mod = await import("./milestoneData.js");
          window.milestones = await mod.getMilestones();
          window.updateUI();
        }
      } catch (err) {
        alert("Failed to edit milestone: " + (err?.message || err));
      } finally {
        btn.disabled = false;
        if (window.showLoader) window.showLoader(false);
      }
    };
  });
  panel.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.onclick = async (e) => {
      const id = btn.getAttribute("data-id");
      if (confirm("Delete this milestone?")) {
        if (window.showLoader) window.showLoader(true);
        btn.disabled = true;
        try {
          await deleteMilestone(id);
          await renderMilestonePanel();
          if (window.updateUI) window.updateUI();
        } catch (err) {
          alert("Failed to delete milestone: " + (err?.message || err));
        } finally {
          btn.disabled = false;
          if (window.showLoader) window.showLoader(false);
        }
      }
    };
  });
}

export { openMilestonePanel, closeMilestonePanel, renderMilestonePanel };
