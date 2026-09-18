export function renderDiagnosticWizard(container) {
  let step = 0; // 0: select device, 1: keyboard checkboxes, 2: mouse checkboxes, 3: result
  let selectedDevice = null;
  let selectedIssues = [];

  const KEYBOARD_ISSUES = [
    { id: 'kb_no_reg', label: 'One or more keys aren\'t registering', recommend: 'keyboard-test', reason: 'Use the Keyboard Tester to check whether individual key presses are being detected by your browser.' },
    { id: 'kb_wrong', label: 'A key is registering incorrectly', recommend: 'keyboard-test', reason: 'The Keyboard Tester will show you exactly what key code your browser receives when you press a key.' },
    { id: 'kb_multi', label: 'Multiple keys aren\'t working', recommend: 'keyboard-test', reason: 'Use the Keyboard Tester to check for ghosting and N-Key Rollover (NKRO) limitations.' },
    { id: 'kb_stuck', label: 'Keys seem to be stuck', recommend: 'keyboard-test', reason: 'The Keyboard Tester will visually highlight any keys that are continuously sending input signals without being pressed.' },
    { id: 'kb_all', label: 'I want to test every key', recommend: 'keyboard-test', reason: 'Press every key on your keyboard to turn the visual Keyboard Tester layout green and ensure 100% functionality.' },
    { id: 'kb_other', label: 'Something else', recommend: 'typing-test', reason: 'Try the Typing Speed Test to see if your keyboard feels right during practical use.' }
  ];

  const MOUSE_ISSUES = [
    { id: 'ms_left', label: 'Left click isn\'t working', recommend: 'mouse-test', reason: 'Check your left click input using the Mouse Button & Movement Tester.' },
    { id: 'ms_right', label: 'Right click isn\'t working', recommend: 'mouse-test', reason: 'Verify right click detection using the Mouse Button & Movement Tester.' },
    { id: 'ms_middle', label: 'Middle click isn\'t working', recommend: 'mouse-test', reason: 'Test your scroll wheel click (middle click) in the Mouse Button & Movement Tester.' },
    { id: 'ms_scroll', label: 'Scroll wheel isn\'t working', recommend: 'mouse-test', reason: 'Scroll up and down to check wheel functionality in the Mouse Tester.' },
    { id: 'ms_move', label: 'Mouse movement isn\'t working correctly', recommend: 'mouse-test', reason: 'Check cursor tracking and polling rate consistency using the Mouse Button & Movement Tester.' },
    { id: 'ms_double', label: 'Mouse double-clicks unexpectedly', recommend: 'double-click-test', reason: 'Hardware chatter can cause accidental double-clicks. The Double Click Tester will detect micro-switch bounce issues.' },
    { id: 'ms_all', label: 'I want to test all mouse buttons', recommend: 'mouse-test', reason: 'Test MB1 through MB5 and scroll inputs simultaneously using the Mouse Tester.' },
    { id: 'ms_other', label: 'Something else', recommend: 'cps-test', reason: 'Try the CPS Test to verify your mouse clicks perform reliably under stress.' }
  ];

  function render() {
    let html = \`
      <div class="info-section" style="margin-top:2.5rem; text-align:left;">
        <h3>🛠️ What's Wrong With My...?</h3>
        <p style="color:var(--text-secondary);">Not sure what's wrong? Answer a few questions and we'll point you to the right CatKeyLab tests.</p>
        
        <div style="background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:1.5rem; margin-top:1.5rem;">
    \`;

    if (step === 0) {
      html += \`
        <h4 style="font-size:1.2rem; margin-bottom:1rem; color:var(--text-primary);">Step 1: Choose what you're having trouble with</h4>
        <div style="display:flex; gap:1rem; flex-wrap:wrap;">
          <button id="wiz-btn-keyboard" class="btn btn-secondary" style="flex:1; padding:1.5rem; font-size:1.2rem; display:flex; flex-direction:column; align-items:center; gap:0.5rem; border:2px solid transparent;">
            <span style="font-size:2rem;">⌨️</span> Keyboard
          </button>
          <button id="wiz-btn-mouse" class="btn btn-secondary" style="flex:1; padding:1.5rem; font-size:1.2rem; display:flex; flex-direction:column; align-items:center; gap:0.5rem; border:2px solid transparent;">
            <span style="font-size:2rem;">🖱️</span> Mouse
          </button>
        </div>
      \`;
    } else if (step === 1 || step === 2) {
      const issues = step === 1 ? KEYBOARD_ISSUES : MOUSE_ISSUES;
      const deviceName = step === 1 ? 'keyboard' : 'mouse';
      
      html += \`
        <h4 style="font-size:1.2rem; margin-bottom:1rem; color:var(--text-primary);">Step 2: What seems to be wrong with your \${deviceName}?</h4>
        <p style="color:var(--text-secondary); margin-bottom:1rem; font-size:0.9rem;">Select all that apply:</p>
        <div style="display:flex; flex-direction:column; gap:0.5rem; margin-bottom:1.5rem;">
          \${issues.map(issue => \`
            <label style="display:flex; align-items:center; gap:0.75rem; background:var(--bg-primary); padding:1rem; border-radius:var(--radius-md); border:1px solid var(--border-color); cursor:pointer; transition:background-color 0.2s;">
              <input type="checkbox" value="\${issue.id}" class="wiz-checkbox" style="width:1.2rem; height:1.2rem; accent-color:var(--accent-primary);" \${selectedIssues.includes(issue.id) ? 'checked' : ''}>
              <span style="color:var(--text-primary); font-weight:500;">\${issue.label}</span>
            </label>
          \`).join('')}
        </div>
        <div style="display:flex; gap:1rem; justify-content:space-between; flex-wrap:wrap;">
          <button id="wiz-btn-back" class="btn btn-secondary">← Back</button>
          <button id="wiz-btn-results" class="btn btn-primary" \${selectedIssues.length === 0 ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>Find Tests →</button>
        </div>
      \`;
    } else if (step === 3) {
      const issues = selectedDevice === 'keyboard' ? KEYBOARD_ISSUES : MOUSE_ISSUES;
      const selectedIssueObjects = issues.filter(i => selectedIssues.includes(i.id));
      
      const recommendations = [];
      const seenRecs = new Set();
      
      selectedIssueObjects.forEach(issue => {
        if (!seenRecs.has(issue.recommend)) {
          seenRecs.add(issue.recommend);
          recommendations.push({
            toolId: issue.recommend,
            reason: issue.reason,
            issueLabel: issue.label
          });
        }
      });

      const TOOL_TITLES = {
        'keyboard-test': 'Keyboard Tester 🖥️',
        'typing-test': 'Typing Speed Test ⌨️',
        'mouse-test': 'Mouse Button & Movement Tester 🖱️',
        'double-click-test': 'Double Click Tester 👆',
        'cps-test': 'CPS Test ⚡'
      };

      html += \`
        <h4 style="font-size:1.2rem; margin-bottom:1rem; color:var(--text-primary);">Recommended Tests</h4>
        <p style="color:var(--text-secondary); margin-bottom:1.5rem;">Based on your selections, we recommend trying these tools. Remember: Browser-based testing checks the input received by the computer, but cannot physically diagnose hardware damage.</p>
        
        <div style="display:flex; flex-direction:column; gap:1rem; margin-bottom:1.5rem;">
          \${recommendations.map(rec => \`
            <div style="background:var(--bg-primary); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1.25rem;">
              <h5 style="color:var(--accent-cyan); font-size:1.15rem; margin-bottom:0.5rem; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.5rem;">
                \${TOOL_TITLES[rec.toolId] || rec.toolId}
                <a href="#\${rec.toolId}" class="btn btn-primary btn-sm" style="font-size:0.9rem; padding:0.4rem 1rem;">Start Test</a>
              </h5>
              <div style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:0.5rem;">
                <span style="background:var(--bg-secondary); padding:0.15rem 0.4rem; border-radius:4px; border:1px solid var(--border-color);">Your Issue: \${rec.issueLabel}</span>
              </div>
              <p style="color:var(--text-primary); font-size:0.95rem;">\${rec.reason}</p>
            </div>
          \`).join('')}
        </div>
        
        <button id="wiz-btn-restart" class="btn btn-secondary">↺ Start Over</button>
      \`;
    }

    html += \`
        </div>
      </div>
    \`;

    container.innerHTML = html;
    attachListeners();
  }

  function attachListeners() {
    if (step === 0) {
      document.getElementById('wiz-btn-keyboard')?.addEventListener('click', () => {
        selectedDevice = 'keyboard';
        selectedIssues = [];
        step = 1;
        render();
      });
      document.getElementById('wiz-btn-mouse')?.addEventListener('click', () => {
        selectedDevice = 'mouse';
        selectedIssues = [];
        step = 2;
        render();
      });
    } else if (step === 1 || step === 2) {
      document.querySelectorAll('.wiz-checkbox').forEach(cb => {
        cb.addEventListener('change', (e) => {
          if (e.target.checked) {
            if (!selectedIssues.includes(e.target.value)) selectedIssues.push(e.target.value);
          } else {
            selectedIssues = selectedIssues.filter(id => id !== e.target.value);
          }
          render();
        });
      });
      
      document.getElementById('wiz-btn-back')?.addEventListener('click', () => {
        step = 0;
        selectedDevice = null;
        selectedIssues = [];
        render();
      });
      
      document.getElementById('wiz-btn-results')?.addEventListener('click', () => {
        if (selectedIssues.length > 0) {
          step = 3;
          render();
        }
      });
    } else if (step === 3) {
      document.getElementById('wiz-btn-restart')?.addEventListener('click', () => {
        step = 0;
        selectedDevice = null;
        selectedIssues = [];
        render();
      });
    }
  }

  render();
}
