export const getCardImageUrl=id=>Number.isInteger(id)&&id>=0&&id<78?`/src/assets/images/cards/${String(id).padStart(2,'0')}.webp`:null
export function prefetchAllCardImages(){for(let id=0;id<22;id++){const image=new Image();image.src=getCardImageUrl(id)}}
