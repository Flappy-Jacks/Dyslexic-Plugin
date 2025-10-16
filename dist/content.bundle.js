function p(o){let t=[],n=document.createTreeWalker(o,NodeFilter.SHOW_TEXT,{acceptNode:function(a){if(!/^(script|style|noscript)$/i.test(a.parentNode.nodeName)&&a.textContent.trim().length>0)return NodeFilter.FILTER_ACCEPT}},!1);for(;node=n.nextNode();)t.push(node);return t}function b(o,t){const i=`
        .bionic-primary {
            font-weight: bold;
            color: ${t?t?"#FFA07A":"blue":o?"#B0C4DE":"blue"};
        }

        .bionic-secondary {
            font-weight: bold;
            color: ${t?t?"#FFB6C1":"grey":o?"#A0D6B4":"grey"};
        }
    `,c=document.createElement("style");c.innerHTML=i,document.head.appendChild(c)}function l(o,t,n){b(o,t),p(document.body).forEach(r=>{let s=h(r,n),i=document.createElement("span");i.innerHTML=s,r.parentNode.replaceChild(i,r)})}function f(){document.querySelectorAll(".bionic-primary, .bionic-secondary").forEach(t=>{t.outerHTML=t.textContent})}function d(o,t,n){f(),l(o,t,n)}function h(o,t){return o.nodeValue.split(/(\s+)/).map(s=>{if(/^\s+$/.test(s))return s;{let i="";return s.split("").forEach((u,g)=>{g===0||g<t&&s.length>t?i+=`<span class="bionic-primary">${u}</span>`:i+=u}),i}}).join("")}let e={isEnabled:!1,focusLength:2,isDarkMode:!1,isDarkMode2:!1};chrome.storage.sync.get(Object.keys(e),o=>{Object.assign(e,o),e.isEnabled&&l(e.isDarkMode,e.isDarkMode2,e.focusLength)});chrome.runtime.onMessage.addListener((o,t,n)=>{switch(o.action){case"activateBionicReading":e.isEnabled=!0,l(e.isDarkMode,e.isDarkMode2,e.focusLength);break;case"deactivateBionicReading":e.isEnabled=!1,f();break;case"updateFocusLength":e.focusLength=parseInt(o.focusLength,10),e.isEnabled&&d(e.isDarkMode,e.isDarkMode2,e.focusLength);break;case"toggleDarkMode":e.isDarkMode=o.isDarkMode,d(e.isDarkMode,e.isDarkMode2,e.focusLength);break;case"toggleDarkMode2":e.isDarkMode2=o.isDarkMode2,d(e.isDarkMode,e.isDarkMode2,e.focusLength);break}});
