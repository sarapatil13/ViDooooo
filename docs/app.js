/**
 * ViDo Documentation Portal & Wiki Engine
 * Shared client-side script for index.html, user.html, and developer.html
 */

(function () {
  'use strict';

  // --- 1. Interactive Widget 1: Progress & Checkpoint Simulator (on user.html) ---
  function initProgressSimulator() {
    const rangeInput = document.getElementById('progressRangeInput');
    const percentDisplay = document.getElementById('sliderPercentDisplay');
    const timelineDisplay = document.getElementById('checkpointTimelineDisplay');

    if (!rangeInput || !percentDisplay || !timelineDisplay) return;

    const sampleCheckpoints = [
      { min: 0, time: "09:00 AM", text: "Task created and assigned. Scope aligned." },
      { min: 25, time: "11:30 AM", text: "Initial draft and structure completed. Awaiting review." },
      { min: 50, time: "02:15 PM", text: "Feedback integrated; 2 of 4 milestones verified." },
      { min: 75, time: "04:00 PM", text: "Final testing underway; audit logs validated." },
      { min: 100, time: "05:30 PM", text: "Completed on time! Final deliverable delivered." }
    ];

    function updateSimulation(val) {
      if (val === 100) {
        percentDisplay.style.color = 'var(--success)';
        percentDisplay.textContent = '100% Completed (On Time)';
      } else {
        percentDisplay.style.color = 'var(--accent)';
        percentDisplay.textContent = val + '% Progress';
      }

      const activeCheckpoints = sampleCheckpoints.filter(cp => val >= cp.min);
      timelineDisplay.innerHTML = activeCheckpoints.map(cp => `
        <div class="checkpoint-item">
          <span class="time">${cp.time}</span>
          <strong>${cp.min}%</strong>: ${cp.text}
        </div>
      `).join('');
    }

    rangeInput.addEventListener('input', (e) => {
      updateSimulation(parseInt(e.target.value, 10));
    });

    updateSimulation(parseInt(rangeInput.value, 10));
  }

  // --- 3. Interactive Widget 2: Calm Dashboard Limiter (on user.html) ---
  function initDashboardLimiter() {
    const btnCalm = document.getElementById('btnFilterCalm');
    const btnAll = document.getElementById('btnFilterAll');
    const container = document.getElementById('taskPreviewContainer');

    if (!btnCalm || !btnAll || !container) return;

    const allTasks = [
      { title: "Review quarterly tax filings", tag: "Today", priority: "high" },
      { title: "Submit team feedback summary", tag: "Today", priority: "medium" },
      { title: "Deploy database migration patch", tag: "Today", priority: "high" },
      { title: "Schedule dental appointment", tag: "Today", priority: "low" },
      { title: "Buy groceries and household items", tag: "Today", priority: "medium" },
      { title: "Renew car registration", tag: "Today (Overflow)", priority: "low", overflow: true },
      { title: "Fix kitchen sink faucet leak", tag: "Today (Overflow)", priority: "medium", overflow: true },
      { title: "Prepare architecture presentation", tag: "Needs Attention", priority: "high" },
      { title: "Follow up with client contract", tag: "Needs Attention", priority: "high" },
      { title: "Research caching layer alternatives", tag: "Needs Attention", priority: "medium" }
    ];

    function renderTasks(mode) {
      container.innerHTML = '';
      const isCalm = mode === 'calm';
      const tasksToRender = isCalm ? allTasks.filter(t => !t.overflow) : allTasks;

      tasksToRender.forEach(task => {
        const item = document.createElement('div');
        item.className = 'task-preview-item';
        item.innerHTML = `
          <span><strong>${task.title}</strong> &middot; <span style="color: var(--text-muted); font-size: 11px;">${task.tag}</span></span>
          <span class="task-badge ${task.priority}">${task.priority.toUpperCase()}</span>
        `;
        container.appendChild(item);
      });

      if (isCalm) {
        const notice = document.createElement('div');
        notice.style.fontSize = '12px';
        notice.style.color = 'var(--text-muted)';
        notice.style.padding = '8px';
        notice.style.textAlign = 'center';
        notice.innerHTML = `<em>+ 2 additional tasks preserved in "View all Today" without cluttering your view.</em>`;
        container.appendChild(notice);
      }
    }

    btnCalm.addEventListener('click', () => {
      btnCalm.classList.add('active');
      btnAll.classList.remove('active');
      renderTasks('calm');
    });

    btnAll.addEventListener('click', () => {
      btnAll.classList.add('active');
      btnCalm.classList.remove('active');
      renderTasks('all');
    });

    renderTasks('calm');
  }

  // --- 4. Interactive Widget 3: Codebase Explorer (on developer.html) ---
  function initTreeExplorer() {
    const container = document.getElementById('treeContainer');
    if (!container) return;

    const treeData = [
      {
        name: "src/components/ui/",
        desc: "Domain-agnostic UI primitives (Button, Card, Badge). Never import Task/User here.",
        files: ["Button.tsx", "Card.tsx", "Badge.tsx", "NoticeModal.tsx", "index.ts"]
      },
      {
        name: "src/features/",
        desc: "Vertical domain slices (landing, workspace, teams, style-lab).",
        files: ["landing/", "workspace/", "teams/", "style-lab/"]
      },
      {
        name: "src/data/",
        desc: "Pure filtering logic & deterministic fixtures anchored to Nov 17 2026.",
        files: ["sampleTasks.ts", "taskFilters.ts", "taskFilters.test.ts"]
      },
      {
        name: "server/",
        desc: "NestJS 11 backend service, Prisma ORM 6, and SSE stream.",
        files: ["prisma/schema.prisma", "src/teams/", "src/tasks/", "src/auth/"]
      }
    ];

    container.innerHTML = treeData.map((node, i) => `
      <div class="tree-node">
        <div class="tree-folder" data-index="${i}">
          <span>📁</span>
          <strong>${node.name}</strong>
          <span class="tree-desc">— ${node.desc}</span>
        </div>
        <div class="tree-content" id="treeFolderContent-${i}" style="display: none;">
          ${node.files.map(f => `<div>📄 ${f}</div>`).join('')}
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.tree-folder').forEach(folder => {
      folder.addEventListener('click', () => {
        const idx = folder.getAttribute('data-index');
        const content = document.getElementById(`treeFolderContent-${idx}`);
        if (content) {
          const isOpen = content.style.display !== 'none';
          content.style.display = isOpen ? 'none' : 'block';
          folder.querySelector('span').textContent = isOpen ? '📁' : '📂';
        }
      });
    });
  }

  // --- 5. Developer Topic Navigation Highlighting (on developer.html) ---
  function initTopicNavigation() {
    const topicButtons = document.querySelectorAll('.topic-card-btn');
    if (!topicButtons.length) return;

    topicButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        topicButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  // --- Initialization ---
  document.addEventListener('DOMContentLoaded', () => {
    initProgressSimulator();
    initDashboardLimiter();
    initTreeExplorer();
    initTopicNavigation();
  });

})();
