import json, numpy as np, cv2
from PIL import Image
OUT='/home/user/shorts/elevator/public/elevator/'
names=['front_calm','front_worried','front_wave','lookup','walk','car_open','pulley','tower','clouds','skyline']
meta={}
for n in names:
    im=Image.open(f'raw/{n}.png').convert('RGBA'); a=np.array(im)
    al=a[:,:,3]; ys,xs=np.where(al>8)
    x0,x1,y0,y1=max(xs.min()-12,0),min(xs.max()+13,a.shape[1]),max(ys.min()-12,0),min(ys.max()+13,a.shape[0])
    c=a[y0:y1,x0:x1]; Image.fromarray(c).save(OUT+f'{n}.png', optimize=True)
    h,w=c.shape[:2]; m={'w':int(w),'h':int(h)}
    al=c[:,:,3]
    if n in ['front_calm','front_worried','front_wave','lookup','walk']:
        a8=(al>128).astype(np.uint8); ff=a8.copy()
        cv2.floodFill(ff,np.zeros((h+2,w+2),np.uint8),(0,0),2)
        solid=np.where(ff==2,0,1).astype(np.uint8)
        dt=cv2.distanceTransform(solid,cv2.DIST_L2,5)
        top=int(h*0.55); hy,hx=np.unravel_index(dt[:top].argmax(),dt[:top].shape)
        m['head']=[int(hx),int(hy),float(dt[hy,hx])]
        rows=np.where((al>128).any(1))[0]; yb=rows.max(); band=al[int(yb-h*0.035):yb+1]>128
        fx=np.where(band.any(0))[0]; m['feet']=[float((fx.min()+fx.max())/2),int(yb)]
    if n=='car_open':
        rgb=c[:,:,:3].astype(int); cream=(rgb[:,:,0]>235)&(rgb[:,:,1]>220)&(rgb[:,:,2]>180)&(rgb[:,:,2]<235)&(al>200)
        ys2,xs2=np.where(cream); m['door']=[int(xs2.min()),int(ys2.min()),int(xs2.max()),int(ys2.max())]
        # body = yellow region bbox
        yel=(rgb[:,:,0]>200)&(rgb[:,:,1]>150)&(rgb[:,:,2]<90)&(al>200); ys3,xs3=np.where(yel)
        m['body']=[int(xs3.min()),int(ys3.min()),int(xs3.max()),int(ys3.max())]
        m['top']=[int(np.where(al[0]>128)[0].mean()) if (al[12]>128).any() else w//2, 12]
    if n=='pulley':
        g=(al>128).astype(np.uint8); rows=np.where(g.any(1))[0]
        # wheel: largest inscribed disc
        dt=cv2.distanceTransform(g,cv2.DIST_L2,5); wy,wx=np.unravel_index(dt.argmax(),dt.shape)
        m['wheel']=[int(wx),int(wy),float(dt[wy,wx])]
        cols=np.where(g[int(h*0.98)-1:].any(0))[0]
        m['bottom']=int(rows.max())
    if n=='tower':
        g=al>128; m['bbox']=[int(np.where(g.any(0))[0].min()),int(np.where(g.any(1))[0].min()),int(np.where(g.any(0))[0].max()),int(np.where(g.any(1))[0].max())]
        # width of tower body near bottom
        r=g[int(h*0.9)]; xx=np.where(r)[0]; m['base']=[int(xx.min()),int(xx.max())]
    meta[n]=m
    print(n,m)
open('/home/user/shorts/elevator/src/elevator/sprites.json','w').write(json.dumps(meta,indent=1))
