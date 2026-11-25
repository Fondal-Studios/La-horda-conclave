import os,sys,glob,json
import numpy as np
from PIL import Image
R="/home/user/La-Horda/assets/sprites"
OUT=sys.argv[1]
ids=sys.argv[2].split(",")
def find(i):
    for g in ("enemies","bosses"):
        for a in os.listdir(f"{R}/{g}"):
            p=f"{R}/{g}/{a}/{i}"
            if os.path.isdir(p): return p
def first_cluster(im):
    a=np.array(im.convert("RGBA"))[:,:,3]>20
    cols=a.any(0); rows=a.any(1)
    # first run of columns in the top band of non-empty rows
    ys=np.where(rows)[0]
    if len(ys)==0: return im
    # split rows into bands (first row of frames)
    r0=ys[0]; r1=r0
    while r1+1<len(rows) and rows[r1+1]: r1+=1
    band=a[r0:r1+1]
    c=band.any(0); xs=np.where(c)[0]
    x0=xs[0]; x1=x0
    gap=0
    for x in range(x0,len(c)):
        if c[x]: x1=x; gap=0
        else:
            gap+=1
            if gap>=3: break
    sub=a[r0:r1+1,x0:x1+1]
    return im.crop((x0,r0,x1+1,r1+1))
def pick(p):
    for n in ("static.png","idle1.png","idle.png","walk1.png"):
        if os.path.exists(f"{p}/{n}"): return Image.open(f"{p}/{n}").convert("RGBA"),n
    for sub in ("v3","v2",""):
        for n in ("atlas.png","walk-strip.png","static.png"):
            q=f"{p}/{sub}/{n}" if sub else f"{p}/{n}"
            if os.path.exists(q): return first_cluster(Image.open(q)),f"{sub}/{n}"
    return None,None
res={}
for i in ids:
    p=find(i)
    if not p: print("NOFOLDER",i);continue
    im,n=pick(p)
    if im is None: print("NOIMG",i);continue
    bb=im.getbbox() or (0,0,*im.size); im=im.crop(bb)
    s=min(240/im.width,240/im.height); s=max(1,int(s)) if im.width<120 else s
    im=im.resize((max(1,int(im.width*s)),max(1,int(im.height*s))),Image.NEAREST if im.width<120 else Image.LANCZOS)
    canvas=Image.new("RGBA",(256,256),(0,0,0,0)); canvas.paste(im,((256-im.width)//2,256-im.height-8),im)
    canvas.save(f"{OUT}/{i}.png"); res[i]=(n,im.size)
print(json.dumps(res))
