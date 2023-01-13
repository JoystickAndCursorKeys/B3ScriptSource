0 cls reset : color 1,0,26 : cls
5 dim cc(5): cc(0)=4: cc(1) = 15: cc(2)= 6: cc(3)= 14: cc(4)= 1
20 w=1024: h=768: ss=0 : w2 = w/2: h2 = h/2 : w3 = (w-w2)/2
25 c=0 : x = w2 : tm=0
30 for s = 10 to 200 step 15: x=x*5  : if x>w3 then x=w2
35 gcolor cc(c): c=c+1: if c>4 then c=0
40 for a = 0 to 6.28 step 2/(s*6.28)
50 sr = sin(ss+a*9) * s/2
60 r=s+sr: plot sin(a)*r + x + sin(tm)*.5, cos(a)*r+ h2
65 tm = tm + .1
70 next: ss=ss+.1: tm=0: next
