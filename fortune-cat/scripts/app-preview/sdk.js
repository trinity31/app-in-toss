const backend='http://127.0.0.1:8019'
export const User={createAnonymousKeyAuthCode:async()=>{
  const r=await fetch(`${backend}/__preview/code`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({customer:'legacy',scenario:'normal'})})
  if(!r.ok)throw Error('Local native adapter unavailable')
  return r.json()
}}
export const Storage={getItem:async key=>localStorage.getItem(key),setItem:async(key,value)=>localStorage.setItem(key,value),removeItem:async key=>localStorage.removeItem(key)}
export const getAnonymousKey=async()=>({type:'HASH',hash:'preview_legacy'})
export const appLogin=async()=>{throw Error('OAuth is not needed in this local anonymous preview')}
export const SafeAreaInsets={get:()=>({top:0,bottom:20,left:0,right:0}),subscribe:()=>()=>{}}
export const getOperationalEnvironment=()=> 'production'
export const getPlatformOS=()=> 'ios'
export const Analytics={click:()=>{},impression:()=>{}}
export const setIosSwipeGestureEnabled=Object.assign(()=>{}, {isSupported:()=>false})
export const graniteEvent={addEventListener:()=>()=>{}}
export const getTossShareLink=async()=>location.origin
export const share=async()=>{}
export const env={appName:'fortune-cat'}
export const GoogleAdMob={loadAppsInTossAdMob:()=>{throw Error('Ads disabled locally')},showAppsInTossAdMob:()=>{throw Error('Ads disabled locally')}}
export const IAP={
  getProductItemList:async()=>({products:[{sku:'preview.deep',displayAmount:'990원',name:'풀이 1회'},{sku:'preview.followup',displayAmount:'990원',name:'추가 질문'}]}),
  getPendingOrders:async()=>({orders:[]}),completeProductGrant:async()=>true,
  createOneTimePurchaseOrder:({options,onEvent,onError})=>{
    let cancelled=false
    queueMicrotask(async()=>{try{
      const orderId=`preview-order-${crypto.randomUUID()}`
      if(!await options.processProductGrant({orderId}))throw Error('Local mock grant declined')
      if(!cancelled)await onEvent({type:'success',data:{orderId}})
    }catch{if(!cancelled)onError?.({code:'LOCAL_PREVIEW_FAILED'})}})
    return()=>{cancelled=true}
  },
}
