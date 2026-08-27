/* ==========================================================================
   CatKeyLab - Interactive Keyboard Tester Component
   ========================================================================== */

import { t } from '../i18n.js';
import { playClickSound } from '../audio.js';

let pressedKeysLog = [];
let uniqueTestedCodes = new Set();

export function renderKeyboardTest(container) {
  uniqueTestedCodes.clear();
  pressedKeysLog = [];

  container.innerHTML = `
    <div class="tool-wrapper" style="border:1px solid var(--accent-cyan-glow);">
      <div class="tool-header-bar">
        <div class="tool-title-group">
          <h1>
            <span style="font-size:2rem;">⌨️</span>
            <span data-i18n="keyboardTestTitle">${t('keyboardTestTitle')}</span>
          </h1>
          <p class="tool-subtitle-text">Test key rollover, ghosting, keycode events, and mechanical switch registration in real-time.</p>
        </div>
        <div class="header-actions">
          <button id="kt-reset-btn" class="btn btn-secondary btn-sm" style="border-color:var(--accent-rose); color:var(--accent-rose);">
            🔄 Reset Keyboard Test
          </button>
        </div>
      </div>

      <!-- Info Dashboard -->
      <div class="stats-dashboard" style="margin-bottom:1.5rem;">
        <div class="stat-box">
          <div id="kt-val-key" class="stat-value" style="font-size:1.4rem; color:var(--accent-cyan);">None</div>
          <div class="stat-label" data-i18n="lblKeyPressed">${t('lblKeyPressed')}</div>
        </div>
        <div class="stat-box">
          <div id="kt-val-code" class="stat-value" style="font-size:1.2rem; color:var(--accent-emerald);">-</div>
          <div class="stat-label" data-i18n="lblKeyCode">${t('lblKeyCode')}</div>
        </div>
        <div class="stat-box">
          <div id="kt-unique-count" class="stat-value" style="font-size:1.4rem; color:var(--accent-amber);">0</div>
          <div class="stat-label">Unique Keys Tested</div>
        </div>
        <div class="stat-box">
          <div id="kt-val-modifiers" class="stat-value" style="font-size:1.1rem; color:var(--text-secondary);">None</div>
          <div class="stat-label" data-i18n="lblModifiers">${t('lblModifiers')}</div>
        </div>
      </div>

      <!-- Virtual Keyboard Render -->
      <div class="keyboard-wrapper">
        <!-- Row 1: Function Keys -->
        <div class="kb-row">
          <div class="kb-key" data-code="Escape">Esc</div>
          <div style="width:20px;"></div>
          <div class="kb-key" data-code="F1">F1</div>
          <div class="kb-key" data-code="F2">F2</div>
          <div class="kb-key" data-code="F3">F3</div>
          <div class="kb-key" data-code="F4">F4</div>
          <div style="width:10px;"></div>
          <div class="kb-key" data-code="F5">F5</div>
          <div class="kb-key" data-code="F6">F6</div>
          <div class="kb-key" data-code="F7">F7</div>
          <div class="kb-key" data-code="F8">F8</div>
          <div style="width:10px;"></div>
          <div class="kb-key" data-code="F9">F9</div>
          <div class="kb-key" data-code="F10">F10</div>
          <div class="kb-key" data-code="F11">F11</div>
          <div class="kb-key" data-code="F12">F12</div>
        </div>

        <!-- Row 2: Number Row -->
        <div class="kb-row">
          <div class="kb-key" data-code="Backquote">\`</div>
          <div class="kb-key" data-code="Digit1">1</div>
          <div class="kb-key" data-code="Digit2">2</div>
          <div class="kb-key" data-code="Digit3">3</div>
          <div class="kb-key" data-code="Digit4">4</div>
          <div class="kb-key" data-code="Digit5">5</div>
          <div class="kb-key" data-code="Digit6">6</div>
          <div class="kb-key" data-code="Digit7">7</div>
          <div class="kb-key" data-code="Digit8">8</div>
          <div class="kb-key" data-code="Digit9">9</div>
          <div class="kb-key" data-code="Digit0">0</div>
          <div class="kb-key" data-code="Minus">-</div>
          <div class="kb-key" data-code="Equal">=</div>
          <div class="kb-key w-2" data-code="Backspace">Backspace</div>
        </div>

        <!-- Row 3: QWERTY -->
        <div class="kb-row">
          <div class="kb-key w-1-5" data-code="Tab">Tab</div>
          <div class="kb-key" data-code="KeyQ">Q</div>
          <div class="kb-key" data-code="KeyW">W</div>
          <div class="kb-key" data-code="KeyE">E</div>
          <div class="kb-key" data-code="KeyR">R</div>
          <div class="kb-key" data-code="KeyT">T</div>
          <div class="kb-key" data-code="KeyY">Y</div>
          <div class="kb-key" data-code="KeyU">U</div>
          <div class="kb-key" data-code="KeyI">I</div>
          <div class="kb-key" data-code="KeyO">O</div>
          <div class="kb-key" data-code="KeyP">P</div>
          <div class="kb-key" data-code="BracketLeft">[</div>
          <div class="kb-key" data-code="BracketRight">]</div>
          <div class="kb-key w-1-5" data-code="Backslash">\\</div>
        </div>

        <!-- Row 4: Home Row -->
        <div class="kb-row">
          <div class="kb-key w-1-5" data-code="CapsLock">Caps Lock</div>
          <div class="kb-key" data-code="KeyA">A</div>
          <div class="kb-key" data-code="KeyS">S</div>
          <div class="kb-key" data-code="KeyD">D</div>
          <div class="kb-key" data-code="KeyF">F</div>
          <div class="kb-key" data-code="KeyG">G</div>
          <div class="kb-key" data-code="KeyH">H</div>
          <div class="kb-key" data-code="KeyJ">J</div>
          <div class="kb-key" data-code="KeyK">K</div>
          <div class="kb-key" data-code="KeyL">L</div>
          <div class="kb-key" data-code="Semicolon">;</div>
          <div class="kb-key" data-code="Quote">'</div>
          <div class="kb-key w-2-5" data-code="Enter">Enter</div>
        </div>

        <!-- Row 5: Bottom Row -->
        <div class="kb-row">
          <div class="kb-key w-2-5" data-code="ShiftLeft">Shift</div>
          <div class="kb-key" data-code="KeyZ">Z</div>
          <div class="kb-key" data-code="KeyX">X</div>
          <div class="kb-key" data-code="KeyC">C</div>
          <div class="kb-key" data-code="KeyV">V</div>
          <div class="kb-key" data-code="KeyB">B</div>
          <div class="kb-key" data-code="KeyN">N</div>
          <div class="kb-key" data-code="KeyM">M</div>
          <div class="kb-key" data-code="Comma">,</div>
          <div class="kb-key" data-code="Period">.</div>
          <div class="kb-key" data-code="Slash">/</div>
          <div class="kb-key w-2-5" data-code="ShiftRight">Shift</div>
        </div>

        <!-- Row 6: Control & Space -->
        <div class="kb-row">
          <div class="kb-key w-1-5" data-code="ControlLeft">Ctrl</div>
          <div class="kb-key w-1-5" data-code="MetaLeft">Win/Cmd</div>
          <div class="kb-key w-1-5" data-code="AltLeft">Alt</div>
          <div class="kb-key w-space" data-code="Space">Space</div>
          <div class="kb-key w-1-5" data-code="AltRight">Alt</div>
          <div class="kb-key w-1-5" data-code="MetaRight">Win/Cmd</div>
          <div class="kb-key w-1-5" data-code="ControlRight">Ctrl</div>
        </div>
      </div>

      <!-- Keystroke Timeline Box -->
      <div style="margin-top:1.5rem; background:var(--bg-card); padding:1rem; border-radius:var(--radius-md); border:1px solid var(--border-color);">
        <div style="font-size:0.8rem; color:var(--text-secondary); text-transform:uppercase; font-weight:700; margin-bottom:0.5rem;">Keystroke History Timeline</div>
        <div id="kt-history-box" style="font-family:monospace; color:var(--accent-cyan); font-size:0.9rem; word-break:break-all;">
          Press any key on your keyboard to begin testing...
        </div>
      </div>
    </div>
  `;

  bindKeyboardEvents();
}

function bindKeyboardEvents() {
  window.addEventListener('keydown', handleKeydown);
  window.addEventListener('keyup', handleKeyup);

  const resetBtn = document.getElementById('kt-reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      uniqueTestedCodes.clear();
      pressedKeysLog = [];
      document.querySelectorAll('.kb-key').forEach(k => {
        k.classList.remove('pressed', 'tested-before');
      });
      const countEl = document.getElementById('kt-unique-count');
      const histEl = document.getElementById('kt-history-box');
      if (countEl) countEl.textContent = '0';
      if (histEl) histEl.textContent = 'Press any key on your keyboard to begin testing...';
    });
  }
}

function handleKeydown(e) {
  // Prevent default scroll/tab navigation on key testing
  if (['Space', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
    e.preventDefault();
  }
  playClickSound(600, 0.03);

  const keyDisplay = document.getElementById('kt-val-key');
  const codeDisplay = document.getElementById('kt-val-code');
  const modDisplay = document.getElementById('kt-val-modifiers');
  const historyBox = document.getElementById('kt-history-box');
  const uniqueCountEl = document.getElementById('kt-unique-count');

  if (keyDisplay) keyDisplay.textContent = e.key === ' ' ? 'Space' : e.key;
  if (codeDisplay) codeDisplay.textContent = e.code;

  uniqueTestedCodes.add(e.code);
  if (uniqueCountEl) uniqueCountEl.textContent = uniqueTestedCodes.size;

  // Modifiers
  let mods = [];
  if (e.shiftKey) mods.push('Shift');
  if (e.ctrlKey) mods.push('Ctrl');
  if (e.altKey) mods.push('Alt');
  if (e.metaKey) mods.push('Meta');
  if (modDisplay) modDisplay.textContent = mods.length ? mods.join(' + ') : 'None';

  // Highlight Virtual Key
  const targetKey = document.querySelector(`.kb-key[data-code="${e.code}"]`);
  if (targetKey) {
    targetKey.classList.add('pressed', 'tested-before');
  }

  // History Log
  pressedKeysLog.unshift(`${e.key === ' ' ? 'Space' : e.key} (${e.code})`);
  if (pressedKeysLog.length > 50) pressedKeysLog.pop();
  if (historyBox) historyBox.textContent = pressedKeysLog.join('  •  ');
}

function handleKeyup(e) {
  const targetKey = document.querySelector(`.kb-key[data-code="${e.code}"]`);
  if (targetKey) {
    targetKey.classList.remove('pressed');
  }
}

export function cleanupKeyboardTest() {
  window.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('keyup', handleKeyup);
}
