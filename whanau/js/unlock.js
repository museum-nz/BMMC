/**
 * Family Lines — published unlock gate.
 * Decrypts js/data.enc.json with the shared family password, then loads the page app.
 * Local browsing does not use this file (it loads plaintext js/data.js instead).
 */
(function () {
  "use strict";

  const PAYLOAD_URL = "js/data.enc.json";
  const SESSION_KEY = "whanau_aes_key_v1";
  const ITERATIONS = 250000;

  const nextScript = document.currentScript && document.currentScript.getAttribute("data-next");

  function showGate(message) {
    if (document.getElementById("whanau-gate")) return;
    const style = document.createElement("style");
    style.textContent = `
      #whanau-gate{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;
        background:linear-gradient(160deg,#f4efe6 0%,#e8dfd0 100%);font-family:Georgia,"Times New Roman",serif;color:#3c3024}
      #whanau-gate .card{width:min(22rem,92vw);padding:1.5rem 1.4rem 1.25rem;background:#fffaf3;
        border:1px solid #cbb89a;box-shadow:0 10px 28px rgba(60,48,36,.12)}
      #whanau-gate h1{margin:0 0 .35rem;font-size:1.35rem}
      #whanau-gate p{margin:0 0 1rem;font-size:.92rem;color:#6a5a48;line-height:1.4}
      #whanau-gate label{display:block;font-size:.8rem;margin-bottom:.3rem;color:#6a5a48}
      #whanau-gate input{width:100%;box-sizing:border-box;padding:.55rem .6rem;border:1px solid #cbb89a;
        background:#fff;font-size:1rem;margin-bottom:.75rem}
      #whanau-gate button{width:100%;padding:.6rem .75rem;border:0;background:#6b3f24;color:#fffaf3;
        font-size:.95rem;cursor:pointer}
      #whanau-gate button:hover{background:#56321c}
      #whanau-gate .err{color:#8a2f2f;font-size:.85rem;min-height:1.2em;margin:.35rem 0 .5rem}
    `;
    document.head.appendChild(style);
    const gate = document.createElement("div");
    gate.id = "whanau-gate";
    gate.innerHTML = `
      <form class="card" autocomplete="current-password">
        <h1>Whānau</h1>
        <p>Family Lines is password-protected. Enter the shared family password to continue.</p>
        <label for="whanau-pass">Password</label>
        <input id="whanau-pass" type="password" name="password" required autofocus />
        <div class="err" id="whanau-err">${message ? escapeHtml(message) : ""}</div>
        <button type="submit">Unlock</button>
      </form>`;
    document.body.appendChild(gate);
    gate.querySelector("form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const pass = gate.querySelector("#whanau-pass").value;
      const err = gate.querySelector("#whanau-err");
      err.textContent = "";
      try {
        await unlockWithPassword(pass);
      } catch (ex) {
        err.textContent = "Incorrect password, or data could not be unlocked.";
        console.warn(ex);
      }
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function b64ToBytes(b64) {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  function bytesToB64(bytes) {
    let s = "";
    const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i]);
    return btoa(s);
  }

  async function deriveKey(password, saltBytes) {
    const enc = new TextEncoder();
    const baseKey = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, [
      "deriveKey",
    ]);
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: saltBytes, iterations: ITERATIONS, hash: "SHA-256" },
      baseKey,
      { name: "AES-GCM", length: 256 },
      true,
      ["decrypt"]
    );
  }

  async function exportRawKey(key) {
    const raw = await crypto.subtle.exportKey("raw", key);
    return bytesToB64(raw);
  }

  async function importRawKey(b64) {
    return crypto.subtle.importKey("raw", b64ToBytes(b64), { name: "AES-GCM" }, false, ["decrypt"]);
  }

  async function fetchPayload() {
    const res = await fetch(PAYLOAD_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("Missing encrypted data payload");
    return res.json();
  }

  async function decryptPayload(key, payload) {
    const iv = b64ToBytes(payload.iv);
    const ct = b64ToBytes(payload.ct);
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
    return new TextDecoder().decode(plain);
  }

  function runDataScript(sourceText) {
    const s = document.createElement("script");
    s.text = sourceText;
    document.head.appendChild(s);
  }

  function loadNext() {
    if (!nextScript) return;
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = nextScript;
      s.onload = resolve;
      s.onerror = () => reject(new Error("Failed to load " + nextScript));
      document.body.appendChild(s);
    });
  }

  function removeGate() {
    const gate = document.getElementById("whanau-gate");
    if (gate) gate.remove();
  }

  async function finish(key, payload, persist) {
    const text = await decryptPayload(key, payload);
    runDataScript(text);
    if (!window.GEN_DATA) throw new Error("Payload did not define GEN_DATA");
    if (persist) {
      try {
        sessionStorage.setItem(SESSION_KEY, await exportRawKey(key));
      } catch (_) {
        /* private mode */
      }
    }
    removeGate();
    await loadNext();
  }

  async function unlockWithPassword(password) {
    const payload = await fetchPayload();
    const salt = b64ToBytes(payload.salt);
    const key = await deriveKey(password, salt);
    await finish(key, payload, true);
  }

  async function trySession() {
    let raw;
    try {
      raw = sessionStorage.getItem(SESSION_KEY);
    } catch (_) {
      return false;
    }
    if (!raw) return false;
    try {
      const payload = await fetchPayload();
      const key = await importRawKey(raw);
      await finish(key, payload, false);
      return true;
    } catch (_) {
      try {
        sessionStorage.removeItem(SESSION_KEY);
      } catch (_) {}
      return false;
    }
  }

  (async function boot() {
    if (window.GEN_DATA) {
      await loadNext();
      return;
    }
    if (await trySession()) return;
    if (!document.body) {
      document.addEventListener("DOMContentLoaded", () => showGate());
    } else {
      showGate();
    }
  })();
})();
