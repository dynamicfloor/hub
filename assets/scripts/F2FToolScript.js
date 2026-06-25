let followersData=null;
let followingsData=null;

const followersInput=document.getElementById("followersFile");
const followingsInput=document.getElementById("followingsFile");

const startBtn=document.getElementById("startBtn");

const exportBtn=document.getElementById("exportBtn");

const importProgress=document.getElementById("importProgress");

const currentDiv=document.getElementById("current");

const logPre=document.getElementById("log");

const progressStats=document.getElementById("progressStats");

const visitedUsers = new Set(
  JSON.parse(localStorage.getItem("visitedUsers") || "[]")
);

const userFlags = JSON.parse(
  localStorage.getItem("userFlags") || "{}"
);

function saveVisited(){

  localStorage.setItem(
    "visitedUsers",
    JSON.stringify([...visitedUsers])
  );
}

function saveFlags(){

  localStorage.setItem(
    "userFlags",
    JSON.stringify(userFlags)
  );
}

function updateProgressStats(){

  const totalFlags = Object.keys(userFlags).length;

  let nf=0;
  let ns=0;
  let ot=0;

  Object.values(userFlags).forEach(v=>{

    if(v==="nf") nf++;

    if(v==="ns") ns++;

    if(v==="ot") ot++;
  });

  progressStats.textContent =
`Processed: ${visitedUsers.size}
Flag Count: ${totalFlags}

NF: ${nf}
NS: ${ns}
OT: ${ot}`;
}

updateProgressStats();

function readJSON(file,cb){

  const reader = new FileReader();

  reader.onload = e => {

    cb(JSON.parse(e.target.result));
  };

  reader.readAsText(file);
}

followersInput.onchange = e => {

  readJSON(e.target.files[0],json=>{

    followersData=json;

    checkReady();
  });
};

followingsInput.onchange = e => {

  readJSON(e.target.files[0],json=>{

    followingsData=json;

    checkReady();
  });
};

function checkReady(){

  startBtn.disabled = !(followersData && followingsData);
}

function normalizeFollowers(data){

  if(Array.isArray(data)) return data;

  if(data.relationships_followers){
    return data.relationships_followers;
  }

  return [];
}

function normalizeFollowings(data){

  if(Array.isArray(data)) return data;

  if(data.relationships_following){
    return data.relationships_following;
  }

  return [];
}

function extractUsername(item){

  const stringData = item?.string_list_data?.[0];

  if(stringData?.value){

    return stringData.value
      .toLowerCase()
      .trim();
  }

  if(stringData?.href){

    let username = stringData.href
      .split("instagram.com/")[1] || "";

    username = username
      .replace("_u/","")
      .replaceAll("/","");

    return username
      .toLowerCase()
      .trim();
  }

  if(item?.title){

    return item.title
      .toLowerCase()
      .trim();
  }

  return null;
}

function markAsVisited(username,link,blockDiv){

  if(!visitedUsers.has(username)){

    visitedUsers.add(username);

    link.classList.add("visited");

    saveVisited();

    checkBlockCompletion(blockDiv);

    updateProgressStats();
  }
}

function createUserLink(username,blockDiv){

  const a=document.createElement("a");

  a.href=`https://www.instagram.com/${username}/`;

  a.target="_blank";

  a.textContent=username;

  if(visitedUsers.has(username)){

    a.classList.add("visited");
  }

  a.addEventListener("click", ()=>{

    markAsVisited(username,a,blockDiv);
  });

  a.addEventListener("mousedown", e=>{

    if(e.button===1){

      markAsVisited(username,a,blockDiv);
    }
  });

  a.addEventListener("auxclick", ()=>{

    markAsVisited(username,a,blockDiv);
  });

  return a;
}

function checkBlockCompletion(blockDiv){

  const links=blockDiv.querySelectorAll("a");

  const allVisited=[...links]
    .every(a=>a.classList.contains("visited"));

  if(allVisited){

    blockDiv.classList.add("done");
  }
}

function applyFlagVisual(userDiv,flag){

  userDiv.classList.remove(
    "flagged-nf",
    "flagged-ns",
    "flagged-ot"
  );

  if(flag){

    userDiv.classList.add(`flagged-${flag}`);
  }
}

function createFlagControls(username,userDiv){

  const flagsDiv=document.createElement("div");

  flagsDiv.classList.add("flags");

  const options=[

    {
      value:"nf",
      label:"NF",
      class:"flag-nf"
    },

    {
      value:"ns",
      label:"NS",
      class:"flag-ns"
    },

    {
      value:"ot",
      label:"OT",
      class:"flag-ot"
    }
  ];

  options.forEach(opt=>{

    const label=document.createElement("label");

    label.className=`flag-option ${opt.class}`;

    const radio=document.createElement("input");

    radio.type="radio";

    radio.name=`flag-${username}`;

    radio.value=opt.value;

    /* restaurar */

    if(userFlags[username]===opt.value){

      radio.checked=true;

      applyFlagVisual(userDiv,opt.value);
    }

    /* toggle */

    radio.addEventListener("click", ()=>{

      /* quitar */

      if(userFlags[username]===opt.value){

        radio.checked=false;

        delete userFlags[username];

        saveFlags();

        applyFlagVisual(userDiv,null);

        updateProgressStats();

        return;
      }

      /* poner */

      userFlags[username]=opt.value;

      saveFlags();

      applyFlagVisual(userDiv,opt.value);

      updateProgressStats();
    });

    label.appendChild(radio);

    label.append(opt.label);

    flagsDiv.appendChild(label);
  });

  return flagsDiv;
}

/* exportar */

exportBtn.onclick=()=>{

  const data={

    visitedUsers:[...visitedUsers],

    userFlags:userFlags,

    exportedAt:new Date().toISOString()
  };

  const blob=new Blob(

    [JSON.stringify(data,null,2)],

    {
      type:"application/json"
    }
  );

  const a=document.createElement("a");

  a.href=URL.createObjectURL(blob);

  a.download="instagram_progress.json";

  a.click();

  URL.revokeObjectURL(a.href);
};

/* importar */

importProgress.onchange=e=>{

  const file=e.target.files[0];

  if(!file) return;

  const reader=new FileReader();

  reader.onload=ev=>{

    try{

      const data=JSON.parse(ev.target.result);

      if(Array.isArray(data.visitedUsers)){

        data.visitedUsers.forEach(u=>{

          visitedUsers.add(u);
        });

        saveVisited();
      }

      if(data.userFlags){

        Object.assign(userFlags,data.userFlags);

        saveFlags();
      }

      updateProgressStats();

      alert("Progreso cargado correctamente");

    }catch(err){

      alert("Archivo inválido");
    }
  };

  reader.readAsText(file);
};

startBtn.onclick=()=>{

  const followersArray=
    normalizeFollowers(followersData);

  const followingsArray=
    normalizeFollowings(followingsData);

  const followersSet=new Set(

    followersArray
      .map(u=>extractUsername(u))
      .filter(Boolean)
  );

  const seen=new Set();

  let notFollowingBack =
    followingsArray.filter(u=>{

      const username=extractUsername(u);

      if(!username || seen.has(username)){

        return false;
      }

      seen.add(username);

      return !followersSet.has(username);
    });

  /* ordenar */

  notFollowingBack.sort((a,b)=>{

    return extractUsername(a)
      .localeCompare(extractUsername(b));
  });

  currentDiv.innerHTML="";

  const chunkSize=20;

  for(let i=0;i<notFollowingBack.length;i+=chunkSize){

    const chunk=
      notFollowingBack.slice(i,i+chunkSize);

    const blockDiv=document.createElement("div");

    blockDiv.classList.add("block");

    blockDiv.classList.add(

      (i/chunkSize)%2===0
        ? "alt1"
        : "alt2"
    );

    const header=document.createElement("div");

    header.classList.add("block-header");

    header.textContent=
      `Users Block ${Math.floor(i/chunkSize)+1}`;

    blockDiv.appendChild(header);

    chunk.forEach(u=>{

      const username=extractUsername(u);

      if(!username) return;

      const userDiv=document.createElement("div");

      userDiv.classList.add("user");

      const link=createUserLink(
        username,
        blockDiv
      );

      const flagControls=createFlagControls(
        username,
        userDiv
      );

      userDiv.appendChild(link);

      userDiv.appendChild(flagControls);

      blockDiv.appendChild(userDiv);
    });

    setTimeout(()=>{

      checkBlockCompletion(blockDiv);

    },0);

    currentDiv.appendChild(blockDiv);
  }

  logPre.textContent=
`Base: ${followersArray.length}
Objective: ${followingsArray.length}
Target: ${notFollowingBack.length}`;
};

