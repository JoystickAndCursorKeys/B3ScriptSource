10 reset : display 100
15 color 1,0,10: CLS
16 goto 110
110 w = width(): h = height()
115 mw = int(w/2) : mh = int( h/2 )
130 ads = .005: rds = 1: r=5 : rd = 0: a=0 : ad = ads
131 mr = mw * 2
132 for cl = 1 to 31
133 ccl = cl: if cl > 15 then ccl = 4
134 gcolor ccl : for t = 0 to 4999
135 ch = int(rnd(0)*5)
136 if ch = 0 then rd = rds
137 if ch = 1 then rd = -rds
138 if ch = 2 then ad = ads
139 if ch = 3 then ad = -ads
140 r = r + rd: r = range( r, 10, mr)
145 a = a + ad
146 if a<0 then a=a+2*pi
147 if a>2*pi then a=a-2*pi
148 ar = r / 50
150 x=int (sin(a+ar)*r) + mw
155 y=int (cos(a+ar)*r) + mh
170 plot x,y
200 next: next
220 rem end
