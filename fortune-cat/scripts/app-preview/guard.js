// This adapter is loaded only by the isolated local launcher, never by the app bundle.
const allowed=new Set([location.origin,'http://127.0.0.1:8019'])
const check=value=>{const url=new URL(typeof value==='string'||value instanceof URL?value:value.url,location.href);if(!allowed.has(url.origin))throw Error('External networking is disabled in local preview');return url}
const nativeFetch=window.fetch.bind(window)
window.fetch=(input,options)=>{check(input);return nativeFetch(input,options)}
const open=XMLHttpRequest.prototype.open
XMLHttpRequest.prototype.open=function(method,url,...args){check(url);return open.call(this,method,url,...args)}
if(navigator.sendBeacon)navigator.sendBeacon=()=>false
