(() => {
  const ORIGIN_TAG = 'go-classroom-companion-v1';

  function announceReady() {
    window.postMessage({source: ORIGIN_TAG, type: 'extension-ready', version: chrome.runtime.getManifest().version}, '*');
  }

  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    const msg = event.data || {};
    if (msg.source !== 'go-school-portal') return;

    if (msg.type === 'extension-ping') {
      announceReady();
    }

    if (msg.type === 'open-student-share') {
      chrome.runtime.sendMessage({
        type: 'open-share',
        mode: 'student',
        studentId: String(msg.studentId || ''),
        studentName: String(msg.studentName || '')
      });
    }

    if (msg.type === 'open-teacher-viewer') {
      chrome.runtime.sendMessage({
        type: 'open-share',
        mode: 'teacher',
        studentId: String(msg.studentId || ''),
        studentName: String(msg.studentName || '')
      });
    }
  });

  announceReady();
})();