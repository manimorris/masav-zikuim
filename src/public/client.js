const rows = document.getElementById('rows');
const errors = document.getElementById('errors');

document.getElementById('addRow').addEventListener('click', (e) => {
  e.preventDefault();
  addRow();
});

document.getElementById('removeLast').addEventListener('click', (e) => {
  e.preventDefault();
  rows.lastElementChild?.remove();
});

document.getElementById('submit').addEventListener('click', async (e) => {
  e.preventDefault();
  errors.textContent = '';

  const payload = buildPayload();
  const response = await fetch('/api/masav/generate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const json = await response.json();
  const blob = new Blob([json.rawFile], { type: 'text/plain;charset=cp862' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = json.fileName;
  link.click();
  URL.revokeObjectURL(link.href);
});

document.getElementById('msvFile').addEventListener('change', async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  await uploadFile(file);
});

rows.addEventListener('click', (e) => {
  if (e.target.classList.contains('remove')) {
    e.preventDefault();
    e.target.closest('tr').remove();
  }
});

const drop = document.getElementById('drop');
drop.addEventListener('dragover', (e) => e.preventDefault());
drop.addEventListener('drop', async (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files?.[0];
  if (file) await uploadFile(file);
});

async function uploadFile(file) {
  errors.textContent = '';
  const form = new FormData();
  form.set('msvZfile', file);
  const response = await fetch('/api/masav/read', { method: 'POST', body: form });
  const json = await response.json();

  if (!response.ok) {
    errors.textContent = (json.errors || ['שגיאה כללית']).join(', ');
    return;
  }

  document.getElementById('codeMosad').value = `${json.mosad.codeMosad}${json.mosad.codeMosadSubject}`;
  document.getElementById('mosadName').value = json.mosad.mosadName;
  document.getElementById('pymtDate').value = json.pymtDetails.pymtDate;

  rows.innerHTML = '';
  json.transactions.forEach(addRow);
}

function addRow(data = {}) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input name="payeeName" value="${data.payeeName || ''}" /></td>
    <td><input name="payeeID" value="${data.payeeID || ''}" /></td>
    <td><input name="pymtSum" type="number" step="0.01" value="${data.pymtSum || ''}" /></td>
    <td><input name="payeeBank" value="${data.payeeBank || ''}" /></td>
    <td><input name="payeeBranch" value="${data.payeeBranch || ''}" /></td>
    <td><input name="payeeAccount" value="${data.payeeAccount || ''}" /></td>
    <td><input name="pymtPeriodfrom" value="${data.pymtPeriodfrom || ''}" /></td>
    <td><input name="pymtPeriodto" value="${data.pymtPeriodto || ''}" /></td>
    <td><input name="pymtRefference" value="${data.pymtRefference || ''}" /></td>
    <td><button class="remove">X</button></td>
  `;
  rows.appendChild(tr);
}

function buildPayload() {
  const rowData = [...rows.querySelectorAll('tr')].map((tr) => {
    const get = (name) => tr.querySelector(`[name="${name}"]`).value;
    return {
      payeeName: get('payeeName'),
      payeeID: get('payeeID'),
      pymtSum: get('pymtSum'),
      payeeBank: get('payeeBank'),
      payeeBranch: get('payeeBranch'),
      payeeAccount: get('payeeAccount'),
      pymtPeriodfrom: get('pymtPeriodfrom'),
      pymtPeriodto: get('pymtPeriodto'),
      pymtRefference: get('pymtRefference'),
    };
  });

  const codeMosad = document.getElementById('codeMosad').value;
  return {
    mosad: {
      codeMosad: codeMosad.slice(0, 5),
      codeMosadSubject: codeMosad.slice(5, 8),
      mosadName: document.getElementById('mosadName').value,
    },
    pymtDetails: {
      pymtDate: document.getElementById('pymtDate').value,
      createDate: document.getElementById('pymtDate').value,
    },
    transactions: rowData,
  };
}

addRow();
