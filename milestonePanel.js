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
        <div class="milestone-row" style="display:flex;align-items:center;gap:12px;justify-content:flex-start;padding:8px 0;position:relative;">
          <span class="milestone-label" style="color: ${
            m.customization?.color || "#00cec9"
          };font-weight:500;">${m.customization?.icon || ""} ${
        m.label || "(No label)"
      }</span>
          <span class="milestone-date" style="font-size:0.95em;color:#b2bec3;">${
            m.date
          } ${m.time || ""}</span>
          <span class="milestone-actions" style="display:flex;gap:8px;margin-left:auto;">
            <button class="edit-btn" data-id="${
              m.id
            }" title="Edit" style="background:#23272f;border-radius:50%;border:none;cursor:pointer;font-size:1.1em;padding:0.4em 0.5em;box-shadow:0 2px 8px #0002;transition:background 0.2s;outline:none;color:#00cec9;">✏️</button>
            <button class="delete-btn" data-id="${
              m.id
            }" title="Delete" style="background:#23272f;border-radius:50%;border:none;cursor:pointer;font-size:1.1em;padding:0.4em 0.5em;box-shadow:0 2px 8px #0002;transition:background 0.2s;outline:none;color:#ff7675;">🗑️</button>
          </span>
          <span class="milestone-loader" style="display:none;position:absolute;right:36px;top:50%;transform:translateY(-50%);">
            <span style="display:inline-block;width:18px;height:18px;border:2.5px solid #00cec9;border-top:2.5px solid #23272f;border-radius:50%;animation:spin 0.7s linear infinite;"></span>
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
      const item = btn.closest(".milestone-row");
      const loader = item.querySelector(".milestone-loader");
      const milestones = await getMilestones();
      const m = milestones.find((m) => m.id === id);
      if (!m) return;
      // Show the Add Milestone modal as Edit, prefill values
      const modal = document.getElementById("add-milestone-modal");
      const form = document.getElementById("add-milestone-form");
      modal.querySelector("h2").textContent = "Edit Milestone";
      document.getElementById("modal-milestone-date").value = m.date || "";
      document.getElementById("modal-milestone-time").value = m.time || "";
      document.getElementById("modal-milestone-label").value = m.label || "";
      document.getElementById("modal-milestone-color").value = m.customization?.color || "#00cec9";
      document.getElementById("modal-milestone-icon").value = m.customization?.icon || "";
      modal.style.display = "flex";
      modal.style.zIndex = 10001;
      modal.focus && modal.focus();
      // Remove any previous submit listeners
      const newForm = form.cloneNode(true);
      form.parentNode.replaceChild(newForm, form);
      // Cancel button logic
      newForm.querySelector('#cancel-add-milestone').onclick = () => {
        modal.style.display = "none";
        newForm.reset();
        modal.querySelector("h2").textContent = "Add Milestone";
      };
      newForm.onsubmit = async (ev) => {
        ev.preventDefault();
        if (loader) loader.style.display = "inline-block";
        btn.disabled = true;
        const newDate = document.getElementById("modal-milestone-date").value;
        const newTime = document.getElementById("modal-milestone-time").value;
        const newLabel = document.getElementById("modal-milestone-label").value;
        const newColor = document.getElementById("modal-milestone-color").value;
        const newIcon = document.getElementById("modal-milestone-icon").value;
        try {
          await editMilestone(id, {
            label: newLabel,
            date: newDate,
            time: newTime,
            customization: { color: newColor, icon: newIcon },
          });
          modal.style.display = "none";
          newForm.reset();
          modal.querySelector("h2").textContent = "Add Milestone";
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
          if (loader) loader.style.display = "none";
        }
      };
    };
  });
  panel.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.onclick = async (e) => {
      const id = btn.getAttribute("data-id");
      const item = btn.closest(".milestone-row");
      const loader = item.querySelector(".milestone-loader");
      if (confirm("Delete this milestone?")) {
        if (loader) loader.style.display = "inline-block";
        btn.disabled = true;
        try {
          await deleteMilestone(id);
          await renderMilestonePanel();
          if (window.updateUI) window.updateUI();
        } catch (err) {
          alert("Failed to delete milestone: " + (err?.message || err));
        } finally {
          btn.disabled = false;
          if (loader) loader.style.display = "none";
        }
      }
    };
  });
  // Spinner animation
  const style = document.createElement("style");
  style.innerHTML = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
  document.head.appendChild(style);
}

export { openMilestonePanel, closeMilestonePanel, renderMilestonePanel };
