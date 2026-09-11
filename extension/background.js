chrome.runtime.onMessage.addListener((message) => {
  if (message?.type !== 'open-share') return;
  const params = new URLSearchParams({
    mode: message.mode === 'teacher' ? 'teacher' : 'student',
    studentId: message.studentId || '',
    studentName: message.studentName || ''
  });
  chrome.tabs.create({url: chrome.runtime.getURL(`share.html?${params.toString()}`)});
});