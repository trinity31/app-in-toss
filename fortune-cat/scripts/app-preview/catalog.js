import {JOB_MENU} from '/src/lib/jobMenu.js'
import cards from './tarot-cards.json'
const ai=[
  {code:'daily_fortune',title_ko:'오늘의 운세',description_ko:'오늘 나에게 찾아오는 흐름과 조언을 살펴봐요',reading_type:'deep_reading_daily',icon:'☀️'},
  {code:'ai_saju_personality',title_ko:'나의 타고난 성향',description_ko:'사주로 나의 성향과 강점을 알아봐요',reading_type:'personality',icon:'🪞'},
  {code:'ai_saju_wealth',title_ko:'나의 재물운',description_ko:'나에게 맞는 재물의 흐름을 살펴봐요',reading_type:'wealth',icon:'💰'},
  {...JOB_MENU},
].map((row,i)=>({id:row.code,theme_type:'ai_saju',is_active:true,display_order:i,...row}))
const year=[{id:'new_year_2026',code:'new_year_2026',theme_type:'new_year',reading_type:'new_year',title_ko:'2026 신년운세',description_ko:'한 해의 흐름과 나에게 맞는 방향을 알아봐요',icon:'✨',is_active:true,display_order:1}]
const banners=[{id:1,key:'tarot',is_active:true,display_order:1,surfaces:['toss'],icon:'🔮',eyebrow:'복냥이의 깊이 있는 이야기',title:'심화 타로상담',description:'마음에 걸리는 고민을 복냥이에게 들려주세요',cta:'고민 이야기하러 가기',color_start:'#FFF3F8',color_end:'#F4ECFF',action_type:'tarot_deep',menu_source:null,menu_code:null}]
const tables={ai_saju_types:ai,new_year_fortune_types:year,saju_reading_types:[],amulet_types:[],home_banners:banners,tarot_cards:cards,app_config:[]}
export const supabase={from(table){
  const query={then(resolve,reject){return Promise.resolve({data:tables[table]||[],error:null}).then(resolve,reject)}}
  for(const name of ['select','eq','or','order','contains','abortSignal','gte','lte','in','limit'])query[name]=()=>query
  query.insert=()=>{throw Error('Database writes disabled in local UI preview')}
  return query
}}
export const fetchTarotCards=async()=>cards
export const getMenuImageUrl=file=>`/src/assets/images/${String(file||'hero.png').split('/').pop()}`
export const getAmuletStyleImageUrl=()=>'/src/assets/images/hero.png'
export const getAmuletIntroImageUrl=getAmuletStyleImageUrl
export const getOgImageUrl=getAmuletStyleImageUrl
export const logDebug=()=>{}
