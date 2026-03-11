var R=document.getElementById("app");if(!R)throw Error("App root is missing");var x={"/":w,"/create":j};window.addEventListener("popstate",L);document.addEventListener("click",(O)=>{let W=O.target?.closest("[data-link]");if(!W)return;O.preventDefault(),M(W.getAttribute("href")??"/")});L();function M(O){if(window.location.pathname!==O)window.history.pushState({},"",O);L()}function L(){(x[window.location.pathname]??x["/"])()}function y(O){R.innerHTML=`
    <header class="topbar">
      <h1 class="brand">MASAV Studio</h1>
      <a class="route-link" data-link href="/">דף הבית</a>
    </header>
    ${O}
  `}function w(){y(`
    <main class="hero">
      <h2>ניהול קבצי MASAV במקום אחד</h2>
      <p>
        העלאה, עריכה ויצירת קובץ זיכויים בפורמט MASAV מתוך ממשק חד, פשוט ונעים לעבודה.
      </p>
      <div class="actions">
        <a class="route-link cta" data-link href="/create">יצירת קובץ MASAV</a>
      </div>
    </main>
  `)}function j(){y(`
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
  `),g()}function g(){let O=document.getElementById("rows"),V=document.getElementById("feedback"),W=document.getElementById("msvFile"),X=document.getElementById("drop"),T=document.getElementById("addRow"),z=document.getElementById("removeLast"),A=document.getElementById("submit");if(!O||!V||!W||!X||!T||!z||!A)return;let Y=(E,G)=>{V.className=G,V.textContent=E},D=()=>{V.className="",V.textContent=""},H=(E={})=>{let G=document.createElement("tr"),J=(U,Z="text")=>{let _=document.createElement("td"),Q=document.createElement("input");if(Q.type=Z,Q.name=U,Q.value=E[U]??"",U==="pymtSum")Q.type="text",Q.inputMode="decimal",Q.value=P(Q.value),Q.addEventListener("blur",()=>{Q.value=P(Q.value)});_.appendChild(Q),G.appendChild(_)};J("payeeName"),J("payeeID"),J("pymtSum","number"),J("payeeBank"),J("payeeBranch"),J("payeeAccount"),J("pymtPeriodfrom"),J("pymtPeriodto"),J("pymtRefference");let K=document.createElement("td"),q=document.createElement("button");q.type="button",q.textContent="X",q.className="secondary row-delete",q.addEventListener("click",()=>G.remove()),K.appendChild(q),G.appendChild(K),O.appendChild(G)},b=()=>{let E=document.getElementById("codeMosad").value.trim(),G=document.getElementById("pymtDate").value,J=Array.from(O.querySelectorAll("tr")).map((K)=>{let q=(U)=>K.querySelector(`[name="${U}"]`)?.value.trim()??"";return{payeeName:q("payeeName"),payeeID:q("payeeID"),pymtSum:P(q("pymtSum")),payeeBank:q("payeeBank"),payeeBranch:q("payeeBranch"),payeeAccount:q("payeeAccount"),pymtPeriodfrom:q("pymtPeriodfrom"),pymtPeriodto:q("pymtPeriodto"),pymtRefference:q("pymtRefference")}});return{mosad:{codeMosad:E.slice(0,5),codeMosadSubject:E.slice(5,8),mosadName:document.getElementById("mosadName").value.trim()},pymtDetails:{pymtDate:G,createDate:G},transactions:J}},B=(E)=>{return new Promise((G)=>{let J=document.getElementById("mosadModal"),K=document.getElementById("saveMosadCode"),q=document.getElementById("skipMosadCode"),U=document.getElementById("modalEmployerName"),Z=document.getElementById("modalEmployerId"),_=document.getElementById("modalCodeMosad"),Q=document.getElementById("modalSaveProfile");if(!J||!K||!q){G(null);return}U.value=E.mosad.mosadName,Z.value=E.employerId??"",_.value="",J.classList.remove("hidden");let S=()=>{J.classList.add("hidden")},C=async()=>{let $=_.value.trim();if($.length!==8||!/^\d+$/.test($)){alert("קוד מוסד חייב להכיל 8 ספרות");return}let N={employerId:E.employerId??"",employerName:E.mosad.mosadName,codeMosad:$.slice(0,5),codeMosadSubject:$.slice(5,8)};if(Q.checked&&N.employerId)await fetch("/api/mosad-profiles",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(N)});S(),G(N)},k=()=>{S(),G(null)};K.onclick=C,q.onclick=k})},F=async(E)=>{D();let G=new FormData;G.set("msvZfile",E);let J=await fetch("/api/masav/read",{method:"POST",body:G}),K=await J.json();if(!J.ok){Y((K.errors??["אירעה שגיאה לא צפויה"]).join(", "),"error");return}if(document.getElementById("mosadName").value=K.mosad.mosadName,document.getElementById("pymtDate").value=K.pymtDetails.pymtDate,O.innerHTML="",K.transactions.forEach((q)=>H(q)),K.needsMosadCode){let q=await B(K);if(q)document.getElementById("codeMosad").value=`${q.codeMosad}${q.codeMosadSubject}`,Y("הקובץ נטען וקוד המוסד נשמר.","success");else Y("הקובץ נטען. יש להזין קוד מוסד.","success")}else document.getElementById("codeMosad").value=`${K.mosad.codeMosad}${K.mosad.codeMosadSubject}`,Y("הקובץ נטען בהצלחה.","success")};T.addEventListener("click",()=>H()),z.addEventListener("click",()=>O.lastElementChild?.remove()),A.addEventListener("click",async()=>{D();let E=b();try{let G=await fetch("/api/masav/generate",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(E)}),J=await G.json();if(!G.ok||!J.rawFileBase64){Y("הפקת הקובץ נכשלה.","error");return}let K=Uint8Array.from(atob(J.rawFileBase64),(Z)=>Z.charCodeAt(0)),q=new Blob([K],{type:"application/octet-stream"}),U=document.createElement("a");U.href=URL.createObjectURL(q),U.download=J.fileName,U.click(),URL.revokeObjectURL(U.href),Y("הקובץ הופק בהצלחה וירד למחשב.","success")}catch{Y("הפקת הקובץ נכשלה.","error")}}),W.addEventListener("change",async()=>{let E=W.files?.[0];if(E)await F(E)}),X.addEventListener("dragover",(E)=>{E.preventDefault(),X.classList.add("is-over")}),X.addEventListener("dragleave",()=>{X.classList.remove("is-over")}),X.addEventListener("drop",async(E)=>{E.preventDefault(),X.classList.remove("is-over");let G=E.dataTransfer?.files?.[0];if(G)await F(G)}),H()}function P(O){let V=O.trim().replace(",",".");if(!V)return"";let W=Number.parseFloat(V);if(!Number.isFinite(W))return"";return W.toFixed(2)}
