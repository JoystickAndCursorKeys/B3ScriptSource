0 cls reset
20 w=1024: h=768: ss=0 : w2 = w/2: h2 = h/2 : w3 = (w-w2)/2
30 for it = 1 to 1000
35 gcolor rnd(0) * 15
40 x= rnd(-1) * w: y= rnd(-1) * h : y2= rnd(-1) * h
45 line x,y , w-x, y2
75 next : cls : goto 30
