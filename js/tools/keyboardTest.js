/* ==========================================================================
   ClickPulse - Interactive Keyboard Tester Component
   ========================================================================== */

import { t } from '../i18n.js';
import { playClickSound } from '../audio.js';

let pressedKeysLog = [];

export function renderKeyboardTest(container) {
  container.innerHTML = `
    <div class="tool-wrapper">
      <div class="tool-header-bar">
        <div class="tool-title-group">
          <h1>
            <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
            </svg>
            <span data-i18n="keyboardTestTitle">${t('keyboardTestTitle')}</span>
          </h1>
          <p class="tool-subtitle-text" data-i18n="keyboardTestSubtitle">${t('keyboardTestSubtitle')}</p>
        </div>
      </div>

      <!-- Info Dashboard -->
      <div class="stats-dashboard" style="margin-bottom:1.5rem;">
        <div class="stat-box">
          <div id="kt-val-key" class="stat-value" style="font-size:1.4rem;">None</div>
          <div class="stat-label" data-i18n="lblKeyPressed">${t('lblKeyPressed')}</div>
        </div>
        <div class="stat-box">
          <div id="kt-val-code" class="stat-value" style="font-size:1.2rem;">-</div>
          <div class="stat-label" data-i18n="lblKeyCode">${t('lblKeyCode')}</div>
        </div>
        <div class="stat-box">
          <div id="kt-val-location" class="stat-value" style="font-size:1.2rem;">Standard</div>
          <div class="stat-label" data-i18n="lblLocation">${t('lblLocation')}</div>
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

        <!-- Row 4: ASDF -->
        <div class="kb-row">
          <div class="kb-key w-2" data-code="CapsLock">Caps Lock</div>
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

        <!-- Row 5: ZXCV -->
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

        <!-- Row 6: Modifiers & Space -->
        <div class="kb-row">
          <div class="kb-key w-1-5" data-code="ControlLeft">Ctrl</div>
          <div class="kb-key w-1-5" data-code="MetaLeft">Win</div>
          <div class="kb-key w-1-5" data-code="AltLeft">Alt</div>
          <div class="kb-key w-space" data-code="Space">Space</div>
          <div class="kb-key w-1-5" data-code="AltRight">Alt</div>
          <div class="kb-key w-1-5" data-code="ControlRight">Ctrl</div>
          <div class="kb-key" data-code="ArrowLeft">←</div>
          <div class="kb-key" data-code="ArrowUp">↑</div>
          <div class="kb-key" data-code="ArrowDown">↓</div>
          <div class="kb-key" data-code="ArrowRight">→</div>
        </div>
      </div>

      <!-- Key History Log -->
      <div style="margin-top:1.5rem;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.5rem;">
          <h3 style="font-size:1.1rem;" data-i18n="lblHistory">${t('lblHistory')}</h3>
          <button id="kt-clear-history" class="btn btn-sm btn-secondary">Clear History</button>
        </div>
        <div id="kt-history-box" style="background:var(--bg-tertiary); padding:1rem; border-radius:var(--radius-md); font-family:monospace; font-size:0.9rem; min-height:60px; max-height:120px; overflow-y:auto; color:var(--text-secondary); border:1px solid var(--border-color);">
          Press any key to begin testing...
        </div>
      </div>
    </div>
  `;

  bindEvents();
}

function bindEvents() {
  window.addEventListener('keydown', handleKeydown);
  window.addEventListener('keyup', handleKeyup);

  const clearBtn = document.getElementById('kt-clear-history');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      pressedKeysLog = [];
      document.getElementById('kt-history-box').textContent = 'History cleared.';
    });
  }
}

function handleKeydown(e) {
  e.preventDefault();
  playClickSound(600, 0.03);

  const keyDisplay = document.getElementById('kt-val-key');
  const codeDisplay = document.getElementById('kt-val-code');
  const locationDisplay = document.getElementById('kt-val-location');
  const modDisplay = document.getElementById('kt-val-modifiers');
  const historyBox = document.getElementById('kt-history-box');

  if (keyDisplay) keyDisplay.textContent = e.key === ' ' ? 'Space' : e.key;
  if (codeDisplay) codeDisplay.textContent = e.code;
  if (locationDisplay) locationDisplay.textContent = getLocationName(e.location);

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
    targetKey.classList.add('pressed');
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

function getLocationName(loc) {
  switch (loc) {
    case 1: return 'Left';
    case 2: return 'Right';
    case 3: return 'Numpad';
    default: return 'Standard';
  }
}

export function cleanupKeyboardTest() {
  window.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('keyup', handleKeyup);
}
