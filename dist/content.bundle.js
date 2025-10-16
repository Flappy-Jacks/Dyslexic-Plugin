function l(t,n,o){h(t,n),y(document.body).forEach(c=>{let a=m(c,o),i=document.createElement("span");i.innerHTML=a,c.parentNode.replaceChild(i,c)})}function g(){document.querySelectorAll(".bionic-primary, .bionic-secondary").forEach(n=>{n.outerHTML=n.textContent})}function d(t,n,o){g(),l(t,n,o)}function m(t,n){return t.nodeValue.split(/(\s+)/).map(a=>{if(/^\s+$/.test(a))return a;{let i="";return a.split("").forEach((f,u)=>{u===0||u<n&&a.length>n?i+=`<span class="bionic-primary">${f}</span>`:i+=f}),i}}).join("")}function y(t){let n=[],o=document.createTreeWalker(t,NodeFilter.SHOW_TEXT,{acceptNode:function(s){if(!/^(script|style|noscript)$/i.test(s.parentNode.nodeName)&&s.textContent.trim().length>0)return NodeFilter.FILTER_ACCEPT}},!1);for(;node=o.nextNode();)n.push(node);return n}function h(t,n){const i=`
        .bionic-primary {
            font-weight: bold;
            color: ${n?n?"#FFA07A":"inherit":t?"#B0C4DE":"inherit"};
        }

        .bionic-secondary {
            font-weight: bold;
            color: ${n?n?"#FFB6C1":"grey":t?"#A0D6B4":"grey"};
        }
    `,r=document.createElement("style");r.innerHTML=i,document.head.appendChild(r)}function p(t){const n=document.getElementById("newFont");if(n&&n.remove(),t==="Default")return;const o=document.createElement("style");o.id="newFont",o.textContent=`
        body, body * {
        font-family: ${t} !important;
        }
    `,document.head.appendChild(o)}let e={isEnabled:!1,focusLength:2,isDarkMode:!1,isDarkMode2:!1,selectedFont:""};chrome.storage.sync.get(Object.keys(e),t=>{Object.assign(e,t),e.isEnabled&&l(e.isDarkMode,e.isDarkMode2,e.focusLength),e.selectedFont&&p(e.selectedFont)});chrome.runtime.onMessage.addListener((t,n,o)=>{switch(t.action){case"changeFont":p(t.fontFamily),e.selectedFont=t.fontFamily;break;case"activateBionicReading":e.isEnabled=!0,l(e.isDarkMode,e.isDarkMode2,e.focusLength);break;case"deactivateBionicReading":e.isEnabled=!1,g();break;case"updateFocusLength":e.focusLength=parseInt(t.focusLength,10),e.isEnabled&&d(e.isDarkMode,e.isDarkMode2,e.focusLength);break;case"toggleDarkMode":e.isDarkMode=t.isDarkMode,d(e.isDarkMode,e.isDarkMode2,e.focusLength);break;case"toggleDarkMode2":e.isDarkMode2=t.isDarkMode2,d(e.isDarkMode,e.isDarkMode2,e.focusLength);break}});
