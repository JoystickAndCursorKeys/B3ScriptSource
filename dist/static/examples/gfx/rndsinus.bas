10 reset : display 100
15 color 1,0,10: CLS
16 goto 110
20 locate 0,0: print : print
30 center "********** B3 Basic Script **********"
35 print
40 center "*** Basic v0.7a, Screen Editor v0.8a, MrBeepAudio v0.6a ***"
45 print
51 cw = width() / cols(): ch = height() / rows()
52 ch$ = cw;"x";ch
60 center "*** Text: ";txt$;", Chars: "; ch$ ;", Gfx: ";width();"x";height();"***"
65 print
80 print: print : fs "script://" : goto 220
110 w = width(): h = height()
115 mw = int(w/2) : mh = int( h/2 )
130 ads = .005: rds = .5: r=5 : rd = 0: a=0 : ad = ads
131 mr = mh-10 : if mw<mh then mr=mw-10
132 for cl = 1 to 31
133 ccl = cl: if cl > 15 then ccl = 4
134 gcolor ccl : for t = 0 to 9999
135 ch = int(rnd(0)*5)
136 if ch = 0 then rd = rds
137 if ch = 1 then rd = -rds
138 if ch = 2 then ad = ads
139 if ch = 3 then ad = -ads
140 r = r + rd: r = range( r, 10, mr)
145 a = a + ad
146 if a<0 then a=a+2*pi
147 if a>2*pi then a=a-2*pi
150 x=int (sin(a)*r) + mw
155 y=int (cos(a)*r) + mh
170 plot x,y
200 next: next
210 goto 20
220 rem end
