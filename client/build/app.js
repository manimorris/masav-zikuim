var w=document.getElementById("app");if(!w)throw Error("App root is missing");var B={"/":y,"/create":v,"/mosad-profiles":M};window.addEventListener("popstate",j);document.addEventListener("click",(Q)=>{let Y=Q.target?.closest("[data-link]");if(!Y)return;Q.preventDefault(),h(Y.getAttribute("href")??"/")});j();function h(Q){if(window.location.pathname!==Q)window.history.pushState({},"",Q);j()}function j(){(B[window.location.pathname]??B["/"])()}function k(Q){w.innerHTML=`
    <header class="topbar">
      <h1 class="brand">MASAV Studio</h1>
      <div class="actions">
        <a class="route-link" data-link href="/">דף הבית</a>
        <a class="route-link" data-link href="/create">יצירת קובץ</a>
        <a class="route-link" data-link href="/mosad-profiles">ניהול מוסדות</a>
      </div>
    </header>
    ${Q}
  `}function y(){k(`
    <main class="hero">
      <h2>ניהול קבצי MASAV במקום אחד</h2>
      <p>
        העלאה, עריכה ויצירת קובץ זיכויים בפורמט MASAV מתוך ממשק חד, פשוט ונעים לעבודה.
      </p>
      <div class="actions">
        <a class="route-link cta" data-link href="/create">יצירת קובץ MASAV</a>
        <a class="route-link" data-link href="/mosad-profiles">ניהול מוסדות</a>
      </div>
    </main>
  `)}function v(){k(`
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
  `),g()}function M(){k(`
    <main class="panel">
      <div id="profilesFeedback"></div>
      <section class="panel-block">
        <h2>ניהול מוסדות שמורים</h2>
        <p class="muted">יצירה ידנית, עריכה ומחיקה של פרופילי מעסיק וקוד מוסד.</p>
      </section>
      <section class="panel-block">
        <form id="profileForm" class="grid profile-grid">
          <div class="field">
            <label for="profileEmployerId">מזהה מעסיק</label>
            <input id="profileEmployerId" maxlength="20" required />
          </div>
          <div class="field">
            <label for="profileEmployerName">שם מעסיק</label>
            <input id="profileEmployerName" required />
          </div>
          <div class="field">
            <label for="profileCodeMosad">קוד מוסד מלא (8 ספרות)</label>
            <input id="profileCodeMosad" maxlength="8" placeholder="לדוגמה: 12345678" required />
          </div>
          <div class="actions">
            <button id="profileSubmit" class="primary" type="submit">שמור מוסד</button>
            <button id="profileCancelEdit" class="secondary hidden" type="button">ביטול עריכה</button>
          </div>
        </form>
      </section>
      <section class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>מזהה מעסיק</th>
              <th>שם מעסיק</th>
              <th>קוד מוסד</th>
              <th>עודכן</th>
              <th>פעולות</th>
            </tr>
          </thead>
          <tbody id="profilesRows"></tbody>
        </table>
      </section>
    </main>
  `),I()}function g(){let Q=document.getElementById("rows"),W=document.getElementById("feedback"),Y=document.getElementById("msvFile"),X=document.getElementById("drop"),z=document.getElementById("addRow"),A=document.getElementById("removeLast"),D=document.getElementById("submit");if(!Q||!W||!Y||!X||!z||!A||!D)return;let Z=(O,U)=>{W.className=U,W.textContent=O},T=()=>{W.className="",W.textContent=""},$=(O={})=>{let U=document.createElement("tr"),K=(J,_="text")=>{let L=document.createElement("td"),V=document.createElement("input");if(V.type=_,V.name=J,V.value=O[J]??"",J==="pymtSum")V.type="text",V.inputMode="decimal",V.value=b(V.value),V.addEventListener("blur",()=>{V.value=b(V.value)});L.appendChild(V),U.appendChild(L)};K("payeeName"),K("payeeID"),K("pymtSum","number"),K("payeeBank"),K("payeeBranch"),K("payeeAccount"),K("pymtPeriodfrom"),K("pymtPeriodto"),K("pymtRefference");let G=document.createElement("td"),q=document.createElement("button");q.type="button",q.textContent="X",q.className="secondary row-delete",q.addEventListener("click",()=>U.remove()),G.appendChild(q),U.appendChild(G),Q.appendChild(U)},S=()=>{let O=document.getElementById("codeMosad").value.trim(),U=document.getElementById("pymtDate").value,K=Array.from(Q.querySelectorAll("tr")).map((G)=>{let q=(J)=>G.querySelector(`[name="${J}"]`)?.value.trim()??"";return{payeeName:q("payeeName"),payeeID:q("payeeID"),pymtSum:b(q("pymtSum")),payeeBank:q("payeeBank"),payeeBranch:q("payeeBranch"),payeeAccount:q("payeeAccount"),pymtPeriodfrom:q("pymtPeriodfrom"),pymtPeriodto:q("pymtPeriodto"),pymtRefference:q("pymtRefference")}});return{mosad:{codeMosad:O.slice(0,5),codeMosadSubject:O.slice(5,8),mosadName:document.getElementById("mosadName").value.trim()},pymtDetails:{pymtDate:U,createDate:U},transactions:K}},F=(O)=>{return new Promise((U)=>{let K=document.getElementById("mosadModal"),G=document.getElementById("saveMosadCode"),q=document.getElementById("skipMosadCode"),J=document.getElementById("modalEmployerName"),_=document.getElementById("modalEmployerId"),L=document.getElementById("modalCodeMosad"),V=document.getElementById("modalSaveProfile");if(!K||!G||!q){U(null);return}J.value=O.mosad.mosadName,_.value=O.employerId??"",L.value="",K.classList.remove("hidden");let N=()=>{K.classList.add("hidden")},P=async()=>{let R=L.value.trim();if(R.length!==8||!/^\d+$/.test(R)){alert("קוד מוסד חייב להכיל 8 ספרות");return}let C={employerId:O.employerId??"",employerName:O.mosad.mosadName,codeMosad:R.slice(0,5),codeMosadSubject:R.slice(5,8)};if(V.checked&&C.employerId)await fetch("/api/mosad-profiles",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(C)});N(),U(C)},E=()=>{N(),U(null)};G.onclick=P,q.onclick=E})},x=async(O)=>{T();let U=new FormData;U.set("msvZfile",O);let K=await fetch("/api/masav/read",{method:"POST",body:U}),G=await K.json();if(!K.ok){Z((G.errors??["אירעה שגיאה לא צפויה"]).join(", "),"error");return}if(document.getElementById("mosadName").value=G.mosad.mosadName,document.getElementById("pymtDate").value=G.pymtDetails.pymtDate,Q.innerHTML="",G.transactions.forEach((q)=>$(q)),G.needsMosadCode){let q=await F(G);if(q)document.getElementById("codeMosad").value=`${q.codeMosad}${q.codeMosadSubject}`,Z("הקובץ נטען וקוד המוסד נשמר.","success");else Z("הקובץ נטען. יש להזין קוד מוסד.","success")}else document.getElementById("codeMosad").value=`${G.mosad.codeMosad}${G.mosad.codeMosadSubject}`,Z("הקובץ נטען בהצלחה.","success")};z.addEventListener("click",()=>$()),A.addEventListener("click",()=>Q.lastElementChild?.remove()),D.addEventListener("click",async()=>{T();let O=S();try{let U=await fetch("/api/masav/generate",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(O)}),K=await U.json();if(!U.ok||!K.rawFileBase64){Z("הפקת הקובץ נכשלה.","error");return}let G=Uint8Array.from(atob(K.rawFileBase64),(_)=>_.charCodeAt(0)),q=new Blob([G],{type:"application/octet-stream"}),J=document.createElement("a");J.href=URL.createObjectURL(q),J.download=K.fileName,J.click(),URL.revokeObjectURL(J.href),Z("הקובץ הופק בהצלחה וירד למחשב.","success")}catch{Z("הפקת הקובץ נכשלה.","error")}}),Y.addEventListener("change",async()=>{let O=Y.files?.[0];if(O)await x(O)}),X.addEventListener("dragover",(O)=>{O.preventDefault(),X.classList.add("is-over")}),X.addEventListener("dragleave",()=>{X.classList.remove("is-over")}),X.addEventListener("drop",async(O)=>{O.preventDefault(),X.classList.remove("is-over");let U=O.dataTransfer?.files?.[0];if(U)await x(U)}),$()}function I(){let Q=document.getElementById("profilesFeedback"),W=document.getElementById("profilesRows"),Y=document.getElementById("profileForm"),X=document.getElementById("profileEmployerId"),z=document.getElementById("profileEmployerName"),A=document.getElementById("profileCodeMosad"),D=document.getElementById("profileSubmit"),Z=document.getElementById("profileCancelEdit");if(!Q||!W||!Y||!X||!z||!A||!D||!Z)return;let T=null,$=(G,q)=>{Q.className=q,Q.textContent=G},S=()=>{Q.className="",Q.textContent=""},F=()=>{T=null,X.value="",z.value="",A.value="",X.disabled=!1,D.textContent="שמור מוסד",Z.classList.add("hidden")},x=(G)=>{if(!G)return"-";let q=new Date(G);if(Number.isNaN(q.getTime()))return G;return q.toLocaleString("he-IL")},O=async()=>{let G=await fetch("/api/mosad-profiles");if(!G.ok)throw Error("טעינת המוסדות נכשלה.");return await G.json()},U=(G)=>{if(W.innerHTML="",G.length===0){let q=document.createElement("tr"),J=document.createElement("td");J.colSpan=5,J.className="empty-state",J.textContent="לא נמצאו מוסדות שמורים.",q.appendChild(J),W.appendChild(q);return}G.forEach((q)=>{let J=document.createElement("tr");J.innerHTML=`
        <td>${H(q.employerId)}</td>
        <td>${H(q.employerName)}</td>
        <td>${H(q.codeMosad)}${H(q.codeMosadSubject)}</td>
        <td>${H(x(q.updatedAt))}</td>
        <td class="actions">
          <button class="secondary profile-edit" type="button">עריכה</button>
          <button class="secondary profile-delete" type="button">מחיקה</button>
        </td>
      `;let _=J.querySelector(".profile-edit"),L=J.querySelector(".profile-delete");_?.addEventListener("click",()=>{S(),T=q.employerId,X.value=q.employerId,z.value=q.employerName,A.value=`${q.codeMosad}${q.codeMosadSubject}`,X.disabled=!0,D.textContent="עדכן מוסד",Z.classList.remove("hidden")}),L?.addEventListener("click",async()=>{if(!window.confirm(`למחוק את המוסד ${q.employerName}?`))return;if(S(),!(await fetch(`/api/mosad-profiles/${encodeURIComponent(q.employerId)}`,{method:"DELETE"})).ok){$("מחיקת המוסד נכשלה.","error");return}if(T===q.employerId)F();await K("המוסד נמחק בהצלחה.")}),W.appendChild(J)})},K=async(G)=>{try{let q=await O();if(U(q),G)$(G,"success")}catch(q){let J=q instanceof Error?q.message:"אירעה שגיאה בטעינת המוסדות.";$(J,"error")}};Z.addEventListener("click",()=>{S(),F()}),Y.addEventListener("submit",async(G)=>{G.preventDefault(),S();let q=X.value.trim(),J=z.value.trim(),_=A.value.trim();if(!q||!J){$("יש להזין מזהה ושם מעסיק.","error");return}if(!/^\d{8}$/.test(_)){$("קוד מוסד חייב להכיל 8 ספרות.","error");return}let L={employerId:q,employerName:J,codeMosad:_.slice(0,5),codeMosadSubject:_.slice(5,8)},V=T!==null,P=await fetch(V?`/api/mosad-profiles/${encodeURIComponent(T??q)}`:"/api/mosad-profiles",{method:V?"PUT":"POST",headers:{"content-type":"application/json"},body:JSON.stringify(L)});if(!P.ok){let E=await P.json().catch(()=>({}));$(E.error??"שמירת המוסד נכשלה.","error");return}F(),await K(V?"המוסד עודכן בהצלחה.":"המוסד נשמר בהצלחה.")}),K()}function H(Q){return Q.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function b(Q){let W=Q.trim().replace(",",".");if(!W)return"";let Y=Number.parseFloat(W);if(!Number.isFinite(Y))return"";return Y.toFixed(2)}
