type MasavPayload = {
  mosad: {
    codeMosad: string;
    codeMosadSubject: string;
    mosadName: string;
  };
  pymtDetails: {
    pymtDate: string;
    createDate: string;
  };
  transactions: Array<{
    payeeName: string;
    payeeID: string;
    pymtSum: string;
    payeeBank: string;
    payeeBranch: string;
    payeeAccount: string;
    pymtPeriodfrom: string;
    pymtPeriodto: string;
    pymtRefference: string;
  }>;
  employerId?: string;
  isOpenformat?: boolean;
  needsMosadCode?: boolean;
};

type MosadProfile = {
  employerId: string;
  employerName: string;
  codeMosad: string;
  codeMosadSubject: string;
};

const app = document.getElementById("app");

if (!app) {
  throw new Error("App root is missing");
}

const routes: Record<string, () => void> = {
  "/": renderHome,
  "/create": renderCreate,
};

window.addEventListener("popstate", renderRoute);
document.addEventListener("click", (event) => {
  const target = event.target as HTMLElement | null;
  const link = target?.closest<HTMLElement>("[data-link]");
  if (!link) {
    return;
  }

  event.preventDefault();
  navigate(link.getAttribute("href") ?? "/");
});

renderRoute();

function navigate(path: string): void {
  if (window.location.pathname !== path) {
    window.history.pushState({}, "", path);
  }
  renderRoute();
}

function renderRoute(): void {
  const page = routes[window.location.pathname] ?? routes["/"];
  page();
}

function renderShell(content: string): void {
  app.innerHTML = `
    <header class="topbar">
      <h1 class="brand">MASAV Studio</h1>
      <a class="route-link" data-link href="/">דף הבית</a>
    </header>
    ${content}
  `;
}

function renderHome(): void {
  renderShell(`
    <main class="hero">
      <h2>ניהול קבצי MASAV במקום אחד</h2>
      <p>
        העלאה, עריכה ויצירת קובץ זיכויים בפורמט MASAV מתוך ממשק חד, פשוט ונעים לעבודה.
      </p>
      <div class="actions">
        <a class="route-link cta" data-link href="/create">יצירת קובץ MASAV</a>
      </div>
    </main>
  `);
}

function renderCreate(): void {
  renderShell(`
    <main class="panel">
      <div id="feedback"></div>

      <div id="drop" class="drop">
        גררו קובץ MASAV או Openformat לכאן
        <input class="file-input" type="file" id="msvFile" accept=".txt,.001,.dat,.xml" />
      </div>

      <section class="grid">
        <div class="field">
          <label for="mosadName">שם המוסד</label>
          <input id="mosadName" />
        </div>
        <div class="field">
          <label for="codeMosad">קוד מוסד מלא (8 ספרות)</label>
          <input id="codeMosad" />
        </div>
        <div class="field">
          <label for="pymtDate">תאריך פרעון</label>
          <input id="pymtDate" type="date" />
        </div>
      </section>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>שם המקבל</th>
              <th>ת.ז</th>
              <th>סכום</th>
              <th>בנק</th>
              <th>סניף</th>
              <th>חשבון</th>
              <th>מתקופה</th>
              <th>עד תקופה</th>
              <th>אסמכתא</th>
              <th>מחק</th>
            </tr>
          </thead>
          <tbody id="rows"></tbody>
        </table>
      </div>

      <div class="actions" style="margin-top: 0.9rem;">
        <button id="addRow" class="secondary" type="button">הוסף שורה</button>
        <button id="removeLast" class="secondary" type="button">מחק שורה אחרונה</button>
        <button id="submit" class="primary" type="button">צור קובץ MASAV</button>
      </div>
    </main>

    <div id="mosadModal" class="modal hidden">
      <div class="modal-content">
        <h3>נדרש קוד מוסד</h3>
        <p>קובץ Openformat לא מכיל קוד מוסד MASAV. אנא הזינו את קוד המוסד:</p>
        <div id="mosadModalBody">
          <div class="field">
            <label>שם המעסיק</label>
            <input id="modalEmployerName" disabled />
          </div>
          <div class="field">
            <label>מזהה מעסיק</label>
            <input id="modalEmployerId" disabled />
          </div>
          <div class="field">
            <label for="modalCodeMosad">קוד מוסד (8 ספרות)</label>
            <input id="modalCodeMosad" placeholder="לדוגמה: 12345678" maxlength="8" />
          </div>
          <label class="checkbox-label">
            <input type="checkbox" id="modalSaveProfile" checked />
            שמור לשימוש עתידי
          </label>
        </div>
        <div class="modal-actions">
          <button id="saveMosadCode" class="primary" type="button">אישור</button>
          <button id="skipMosadCode" class="secondary" type="button">דלג</button>
        </div>
      </div>
    </div>
  `);

  setupCreatePage();
}

function setupCreatePage(): void {
  const rows = document.getElementById("rows") as HTMLTableSectionElement | null;
  const feedback = document.getElementById("feedback") as HTMLDivElement | null;
  const fileInput = document.getElementById("msvFile") as HTMLInputElement | null;
  const drop = document.getElementById("drop") as HTMLDivElement | null;
  const addRowBtn = document.getElementById("addRow") as HTMLButtonElement | null;
  const removeLastBtn = document.getElementById("removeLast") as HTMLButtonElement | null;
  const submitBtn = document.getElementById("submit") as HTMLButtonElement | null;

  if (!rows || !feedback || !fileInput || !drop || !addRowBtn || !removeLastBtn || !submitBtn) {
    return;
  }

  const showMessage = (text: string, type: "error" | "success") => {
    feedback.className = type;
    feedback.textContent = text;
  };

  const clearMessage = () => {
    feedback.className = "";
    feedback.textContent = "";
  };

  const addRow = (data: Partial<MasavPayload["transactions"][number]> = {}) => {
    const tr = document.createElement("tr");

    const addInputCell = (name: keyof MasavPayload["transactions"][number], inputType = "text") => {
      const td = document.createElement("td");
      const input = document.createElement("input");
      input.type = inputType;
      input.name = name;
      input.value = data[name] ?? "";

      if (name === "pymtSum") {
        input.type = "text";
        input.inputMode = "decimal";
        input.value = normalizeAmountInput(input.value);
        input.addEventListener("blur", () => {
          input.value = normalizeAmountInput(input.value);
        });
      }

      td.appendChild(input);
      tr.appendChild(td);
    };

    addInputCell("payeeName");
    addInputCell("payeeID");
    addInputCell("pymtSum", "number");
    addInputCell("payeeBank");
    addInputCell("payeeBranch");
    addInputCell("payeeAccount");
    addInputCell("pymtPeriodfrom");
    addInputCell("pymtPeriodto");
    addInputCell("pymtRefference");

    const deleteCell = document.createElement("td");
    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.textContent = "X";
    deleteBtn.className = "secondary row-delete";
    deleteBtn.addEventListener("click", () => tr.remove());
    deleteCell.appendChild(deleteBtn);
    tr.appendChild(deleteCell);

    rows.appendChild(tr);
  };

  const readFormData = (): MasavPayload => {
    const codeMosad = (document.getElementById("codeMosad") as HTMLInputElement).value.trim();
    const pymtDate = (document.getElementById("pymtDate") as HTMLInputElement).value;

    const transactions = Array.from(rows.querySelectorAll("tr")).map((tr) => {
      const get = (name: keyof MasavPayload["transactions"][number]) =>
        (tr.querySelector(`[name="${name}"]`) as HTMLInputElement | null)?.value.trim() ?? "";

      return {
        payeeName: get("payeeName"),
        payeeID: get("payeeID"),
        pymtSum: normalizeAmountInput(get("pymtSum")),
        payeeBank: get("payeeBank"),
        payeeBranch: get("payeeBranch"),
        payeeAccount: get("payeeAccount"),
        pymtPeriodfrom: get("pymtPeriodfrom"),
        pymtPeriodto: get("pymtPeriodto"),
        pymtRefference: get("pymtRefference"),
      };
    });

    return {
      mosad: {
        codeMosad: codeMosad.slice(0, 5),
        codeMosadSubject: codeMosad.slice(5, 8),
        mosadName: (document.getElementById("mosadName") as HTMLInputElement).value.trim(),
      },
      pymtDetails: {
        pymtDate,
        createDate: pymtDate,
      },
      transactions,
    };
  };

  const showMosadModal = (json: MasavPayload): Promise<MosadProfile | null> => {
    return new Promise((resolve) => {
      const modal = document.getElementById("mosadModal");
      const saveBtn = document.getElementById("saveMosadCode");
      const skipBtn = document.getElementById("skipMosadCode");
      const employerNameInput = document.getElementById("modalEmployerName") as HTMLInputElement;
      const employerIdInput = document.getElementById("modalEmployerId") as HTMLInputElement;
      const codeMosadInput = document.getElementById("modalCodeMosad") as HTMLInputElement;
      const saveCheckbox = document.getElementById("modalSaveProfile") as HTMLInputElement;

      if (!modal || !saveBtn || !skipBtn) {
        resolve(null);
        return;
      }

      employerNameInput.value = json.mosad.mosadName;
      employerIdInput.value = json.employerId ?? "";
      codeMosadInput.value = "";

      modal.classList.remove("hidden");

      const closeModal = () => {
        modal.classList.add("hidden");
      };

      const handleSave = async () => {
        const code = codeMosadInput.value.trim();
        if (code.length !== 8 || !/^\d+$/.test(code)) {
          alert("קוד מוסד חייב להכיל 8 ספרות");
          return;
        }

        const profile: MosadProfile = {
          employerId: json.employerId ?? "",
          employerName: json.mosad.mosadName,
          codeMosad: code.slice(0, 5),
          codeMosadSubject: code.slice(5, 8),
        };

        if (saveCheckbox.checked && profile.employerId) {
          await fetch("/api/mosad-profiles", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(profile),
          });
        }

        closeModal();
        resolve(profile);
      };

      const handleSkip = () => {
        closeModal();
        resolve(null);
      };

      saveBtn.onclick = handleSave;
      skipBtn.onclick = handleSkip;
    });
  };

  const uploadFile = async (file: File) => {
    clearMessage();

    const form = new FormData();
    form.set("msvZfile", file);

    const response = await fetch("/api/masav/read", { method: "POST", body: form });
    const json = (await response.json()) as MasavPayload;

    if (!response.ok) {
      showMessage(
        ((json as unknown as { errors?: string[] }).errors ?? ["אירעה שגיאה לא צפויה"]).join(", "),
        "error"
      );
      return;
    }

    // Fill form fields
    (document.getElementById("mosadName") as HTMLInputElement).value = json.mosad.mosadName;
    (document.getElementById("pymtDate") as HTMLInputElement).value = json.pymtDetails.pymtDate;

    rows.innerHTML = "";
    json.transactions.forEach((tx: MasavPayload["transactions"][number]) => addRow(tx));

    // Check if mosad code is needed
    if (json.needsMosadCode) {
      const profile = await showMosadModal(json);
      if (profile) {
        (document.getElementById("codeMosad") as HTMLInputElement).value =
          `${profile.codeMosad}${profile.codeMosadSubject}`;
        showMessage("הקובץ נטען וקוד המוסד נשמר.", "success");
      } else {
        showMessage("הקובץ נטען. יש להזין קוד מוסד.", "success");
      }
    } else {
      (document.getElementById("codeMosad") as HTMLInputElement).value =
        `${json.mosad.codeMosad}${json.mosad.codeMosadSubject}`;
      showMessage("הקובץ נטען בהצלחה.", "success");
    }
  };

  addRowBtn.addEventListener("click", () => addRow());
  removeLastBtn.addEventListener("click", () => rows.lastElementChild?.remove());

  submitBtn.addEventListener("click", async () => {
    clearMessage();

    const payload = readFormData();

    try {
      const response = await fetch("/api/masav/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await response.json();
      if (!response.ok || !json.rawFileBase64) {
        showMessage("הפקת הקובץ נכשלה.", "error");
        return;
      }

      const bytes = Uint8Array.from(atob(json.rawFileBase64), (char) => char.charCodeAt(0));
      const blob = new Blob([bytes], { type: "application/octet-stream" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = json.fileName;
      link.click();
      URL.revokeObjectURL(link.href);

      showMessage("הקובץ הופק בהצלחה וירד למחשב.", "success");
    } catch {
      showMessage("הפקת הקובץ נכשלה.", "error");
    }
  });

  fileInput.addEventListener("change", async () => {
    const file = fileInput.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  });

  drop.addEventListener("dragover", (event) => {
    event.preventDefault();
    drop.classList.add("is-over");
  });

  drop.addEventListener("dragleave", () => {
    drop.classList.remove("is-over");
  });

  drop.addEventListener("drop", async (event) => {
    event.preventDefault();
    drop.classList.remove("is-over");

    const file = event.dataTransfer?.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  });

  addRow();
}

function normalizeAmountInput(value: string): string {
  const cleaned = value.trim().replace(",", ".");
  if (!cleaned) {
    return "";
  }

  const parsed = Number.parseFloat(cleaned);
  if (!Number.isFinite(parsed)) {
    return "";
  }

  return parsed.toFixed(2);
}
