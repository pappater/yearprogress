// UI for the right-side milestone management panel
// Exports: openMilestonePanel, closeMilestonePanel, renderMilestonePanel
import {
  getMilestones,
  editMilestone,
  deleteMilestone,
  setMilestoneCustomization,
} from "./milestoneData.js";

function openMilestonePanel() {
  const overlay = document.getElementById("milestone-panel-overlay");
  const panel = document.getElementById("milestone-panel");
  overlay.style.display = "block";
  setTimeout(() => {
    panel.style.right = "0";
  }, 10);
  // Click outside panel closes it
  overlay.onclick = function (e) {
    if (e.target === overlay) closeMilestonePanel();
  };
}

function closeMilestonePanel() {
  const overlay = document.getElementById("milestone-panel-overlay");
  const panel = document.getElementById("milestone-panel");
  panel.style.right = "-400px";
  setTimeout(() => {
    overlay.style.display = "none";
  }, 300);
}

async function renderMilestonePanel() {
  const panel = document.getElementById("milestone-panel-content");
  const milestones = await getMilestones();
  panel.innerHTML = "";
  if (milestones.length === 0) {
    panel.innerHTML = '<div class="empty">No milestones yet.</div>';
    return;
  }
  // Split milestones: today's at top, rest below
  const todayStr = new Date().toISOString().slice(0, 10);
  const todays = milestones.filter((m) => m.date === todayStr);
  const rest = milestones.filter((m) => m.date !== todayStr);

  function renderMilestoneList(list) {
    list.forEach((m) => {
      const item = document.createElement("div");
      item.className = "milestone-item";
      item.innerHTML = `
        <div class="milestone-label" style="color: ${
          m.customization?.color || "#00cec9"
        }; display:flex; align-items:center; justify-content:space-between;">
          <span>${m.customization?.icon || ""} ${m.label || "(No label)"}</span>
          <span class="milestone-date" style="font-size:0.95em;color:#b2bec3;margin-left:8px;">${
            m.date
          } ${m.time || ""}</span>
          <span class="milestone-actions" style="margin-left:12px;">
            <button class="edit-btn" data-id="${
              m.id
            }" title="Edit" style="background:none;border:none;cursor:pointer;font-size:1.1em;">✏️</button>
            <button class="delete-btn" data-id="${
              m.id
            }" title="Delete" style="background:none;border:none;cursor:pointer;font-size:1.1em;">🗑️</button>
          </span>
        </div>
      `;
      panel.appendChild(item);
    });
  }

  if (todays.length > 0) {
    const todayHeader = document.createElement("div");
    todayHeader.textContent = "Today's Milestones";
    todayHeader.style = "font-weight:bold;color:#00cec9;margin:8px 0 4px 0;";
    panel.appendChild(todayHeader);
    renderMilestoneList(todays);
  }
  if (rest.length > 0) {
    if (todays.length > 0) {
      const sep = document.createElement("div");
      sep.style = "height:12px;";
      panel.appendChild(sep);
    }
    const restHeader = document.createElement("div");
    restHeader.textContent = "Other Milestones";
    restHeader.style = "font-weight:bold;color:#b2bec3;margin:8px 0 4px 0;";
    panel.appendChild(restHeader);
    renderMilestoneList(rest);
  }
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
