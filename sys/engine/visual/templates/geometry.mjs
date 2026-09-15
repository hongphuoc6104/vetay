export function segmentHitsRect(a,b,r,padding=0){
 const q={x:r.x-padding,y:r.y-padding,w:r.w+padding*2,h:r.h+padding*2};
 let low=0,high=1;const dx=b[0]-a[0],dy=b[1]-a[1];
 for(const [p,v] of [[-dx,a[0]-q.x],[dx,q.x+q.w-a[0]],[-dy,a[1]-q.y],[dy,q.y+q.h-a[1]]]){if(p===0){if(v<0)return false;}else{const t=v/p;if(p<0)low=Math.max(low,t);else high=Math.min(high,t);if(low>high)return false;}}return true;
}
export function collision(points,boxes,padding=0,except){for(const b of boxes){if(b.id===except)continue;for(let i=1;i<points.length;i++)if(segmentHitsRect(points[i-1],points[i],b,padding))return b.id;}return null;}
export function partialPath(points,progress){
 if(progress<=0)return [];if(progress>=1)return points;const distances=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1]));let rest=distances.reduce((a,b)=>a+b,0)*progress;const out=[points[0]];
 for(let i=0;i<distances.length;i++){if(distances[i]===0)continue;const f=Math.min(1,rest/distances[i]);out.push([points[i][0]+(points[i+1][0]-points[i][0])*f,points[i][1]+(points[i+1][1]-points[i][1])*f]);rest-=distances[i];if(rest<=0)break;}return out;
}
