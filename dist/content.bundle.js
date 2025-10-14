function h(e){let t=[],o=document.createTreeWalker(e,NodeFilter.SHOW_TEXT,{acceptNode:function(i){if(!/^(script|style|noscript)$/i.test(i.parentNode.nodeName)&&i.textContent.trim().length>0)return NodeFilter.FILTER_ACCEPT}},!1);for(;node=o.nextNode();)t.push(node);return t}function b(e,t){const n=`
        .bionic-primary {
            font-weight: bold;
            color: ${t?t?"#FFA07A":"inherit":e?"#B0C4DE":"inherit"};
        }

        .bionic-secondary {
            font-weight: bold;
            color: ${t?t?"#FFB6C1":"grey":e?"#A0D6B4":"grey"};
        }
    `,f=document.createElement("style");f.innerHTML=n,document.head.appendChild(f)}function g(e,t,o){b(e,t),h(document.body).forEach(l=>{let c=C(l,o),n=document.createElement("span");n.innerHTML=c,l.parentNode.replaceChild(n,l)})}function m(){document.querySelectorAll(".bionic-primary, .bionic-secondary").forEach(t=>{t.outerHTML=t.textContent})}function p(e,t,o){m(),g(e,t,o)}function C(e,t){return e.nodeValue.split(/(\s+)/).map(c=>{if(/^\s+$/.test(c))return c;{let n="";return c.split("").forEach((u,y)=>{y===0||y<t&&c.length>t?n+=`<span class="bionic-primary">${u}</span>`:n+=u}),n}}).join("")}let d=!1,a=2,r=!1,s=!1;chrome.storage.sync.get(["isEnabled","focusLength","isDarkMode","isDarkMode2"],({isEnabled:e,focusLength:t,isDarkMode:o,isDarkMode2:i})=>{d=e,a=t||2,r=o||!1,s=i||!1,d&&g(r,s,a)});chrome.runtime.onMessage.addListener((e,t,o)=>{e.action==="activateBionicReading"?(d=!0,g(r,s,a)):e.action==="deactivateBionicReading"?(d=!1,m()):e.action==="updateFocusLength"?(a=parseInt(e.focusLength,10),d&&p(r,s,a)):e.action==="toggleDarkMode"?(r=e.isDarkMode,p(r,s,a)):e.action==="toggleDarkMode2"&&(s=e.isDarkMode2,p(r,s,a))});
