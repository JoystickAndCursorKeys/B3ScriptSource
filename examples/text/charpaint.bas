10 sw=60: sh=30 : cx=4: cy=4 : offsetx = 1: offsety = 7
15 dc=496: dcol=1:dbgc = 0
16 guibg = 9
17 stacksz = 1000
20 dim pic(sw,sh,3): dim fillx(stacksz), filly(stacksz)
21 color 1,guibg,10: cls
25 for x=0 to sw: for y=0 to sh
26 pic(x,y,0)=32
27 pic(x,y,1)=1
28 pic(x,y,2)=0
29 next: next
50 gosub drawpic
60 goto initpaint

500 sub initpaint
510 flip=0 : mode$="paint"
515 gosub drawcursor
580 gosub updatedash
590 goto paint

1000 sub paint
1010 IF flip=1 THEN gosub paintop
1012 wf=ti + 20

1015 sub waitloop
1016 if ti < wf then goto waitloop
1017 getkey KEY$ : if KEY$ = "" then goto paint
1020 IF KEY$="ArrowUp"    THEN gosub clearcursor: cY=cY-1: cY=RANGE( cY,0,sh-1 ) : gosub drawcursor : goto paint
1030 IF KEY$="ArrowDown"  THEN gosub clearcursor: cY=cY+1: cY=RANGE( cY,0,sh-1 ) : gosub drawcursor  : goto paint
1040 IF KEY$="ArrowLeft"  THEN gosub clearcursor: cX=cX-1: cX=RANGE( cX,0,sw-1 ) : gosub drawcursor  : goto paint
1050 IF KEY$="ArrowRight" THEN gosub clearcursor: cX=cX+1: cX=RANGE( cX,0,sw-1 ) : gosub drawcursor  : goto paint
1061 IF KEY$="s" THEN gosub selectchar:  color 1,guibg,10: cls : gosub drawpic : gosub drawcursor : gosub updatedash
1062 IF KEY$="c" THEN ctype$="fg" : gosub selectcolor:  color 1,guibg,10: cls : gosub drawpic : gosub drawcursor: gosub updatedash
1063 IF KEY$="b" THEN ctype$="bg" : gosub selectcolor:  color 1,guibg,10: cls : gosub drawpic : gosub drawcursor: gosub updatedash
1064 IF KEY$="i" THEN tmp=pic(cx,cy,1): pic(cx,cy,1) = pic(cx,cy,2): pic(cx,cy,2) = tmp: gosub drawpic: gosub drawcursor
1065 IF KEY$="m" THEN gosub nextmode : gosub updatedash
1066 IF KEY$="x" THEN gosub export2clip
1067 IF KEY$="l" THEN gosub loadpic : gosub drawpic
1068 IF KEY$="Delete" THEN pic(cx,cy,0) = 32 : pic(cx,cy,1) = dcol : pic(cx,cy,2) = dbgc: flip = 0: border 10
1069 IF KEY$="f" THEN gosub fill : gosub drawpic
1070 IF KEY$=" " THEN flip = 1-flip: border 10: if flip = 1 then border 2: gosub updatedash
1500 goto paint

2000 sub storepic

2500 sub updatedash
2501 locate 0,0
2502 print : color 05: print "     B3 Character ";: color 11: print "Painter": print
2505 color 1,guibg
2510 print "  Mode: " ; mode$
2520 print "Colors: ";: color dcol, dbgc:  print "ABCabc";
2598 color 1,guibg : print pad$( "  Char: "; chr$( dc ), " ", 25-9)
2599 return

2600 sub nextmode
2610 if mode$ = "paint" then mode$ = "color" : return
2620 if mode$ = "color" then mode$ = "paint" : return

2700 sub colormode
2710 if mode$ <> "color" then mode$ = "color" : return
2720 return


3000 sub drawpic
3025 for x=0 to sw-1: for y=0 to sh-1
3026 pokeccl x+offsetx, y+offsety , pic(x,y,0), pic(x,y,1), pic(x,y,2)
3029 next: next
3900 return

4000 sub selectchar
4001 color 1,0,10 : cls : scv=dc
4005 color 1: tx=0: txc=0: ty=0 : locate 2,0: print 256
4010 for tc = 0 to 255+128
4011 if tx>15 then tx=0: txc=0:ty=ty+1: locate 2+ty,0: print (tc+256)
4015  pokec txc+5,ty+2,256+tc
4020  tx=tx+1: txc=txc + 1
4025  if txc % 4 = 0 then txc=txc+8: locate 2+ty,txc-1: print (tc+1+256)
4030 next

4035 sub inputselchar
4040 locate 4+ty,0 : print "          " : locate 4+ty,0 : input t$
4050 if t$="c" or t$="b" then locate 5+ty,0 : print "      " : locate 5+ty,0 : input u$
4061 if t$ = "" or t$ = "q" or t$ = "x" then return
4065 dc = val( t$ )
4090 return

5000 sub drawcursor
5005 scrx = cx + offsetx: scry = cy + offsety
5010 pokeccl scrx, scry, dc,0,1
5020 return

6000 sub clearcursor
6005 scrx = cx + offsetx: scry = cy + offsety
6010 pokeccl scrx, scry, pic(cx,cy,0), pic(cx,cy,1), pic(cx,cy,2)
6020 return

7000 sub selectcolor
7001 color 1,0,10 : cls : scol = dcol : sbg = dbgc : scv=dc
7005 for c = 0 to 31
7006 if c = 16 then print
7010 color 0,c
7015 if c = 0 or c = 16 then color 1,c
7020 print pad$( c;"", "0", 2) ;
7030 next : color 1,0: print
7035 input col$
7036 if col$ = "" or col$ = "q" or col$ = "x" then return
7040 if ctype$ = "bg" then dbgc = val( col$ )
7045 if ctype$ = "fg" then dcol = val( col$ )
7050 return

8000 sub paintop
8010 if mode$ = "paint" then pic(cx,cy,0) = dc: pic(cx,cy,1) = dcol: pic(cx,cy,2)=dbgc
8020 if mode$ = "color" then pic(cx,cy,1) = dcol: pic(cx,cy,2)=dbgc
8100 return

9000 sub fill
9001 rem input cx, cy, dc, dcol, dbgc
9010 fstackptr=-1
9030 fx = cx:  fy=cy : fch = dc : fcol= dcol : fcolbg = dbgc
9040 stx = fx: sty= fy: gosub stackpush
9050 fbgch = pic(fx,fy,0): fbgcl = pic(fx,fy,1) : fbgbgcl = pic(fx,fy,2)
9100 rem fillloop
9110 if fstackptr = -1 then return
9120 gosub stackpop
9130 pic( fx ,fy, 0 ) = fch: pic( fx ,fy, 1 ) = fcol: pic( fx ,fy, 2 ) = fcolbg
9140 tx= fx+1: ty = fy : gosub testxy
9145 if tflag = 1 then stx = tx: sty = ty: gosub stackpush
9150 tx= fx-1: ty = fy : gosub testxy
9155 if tflag = 1 then stx = tx: sty = ty: gosub stackpush
9160 tx= fx: ty = fy+1 : gosub testxy
9165 if tflag = 1 then stx = tx: sty = ty: gosub stackpush
9170 tx= fx: ty = fy-1 : gosub testxy
9175 if tflag = 1 then stx = tx: sty = ty: gosub stackpush
9190 goto 9100 : rem goto filloop

10000 sub stackpush
10001 if fstackptr >= stacksz then return
10005 fstackptr = fstackptr + 1
10010 fillx( fstackptr ) = stx:  filly( fstackptr ) = sty
10030 return

11000 sub stackpop
11010 fx = fillx( fstackptr ): fy = filly( fstackptr )
11020 fstackptr = fstackptr - 1
11030 return

12000 sub testxy
12010 tflag = 0
12020 if tx < 0 or ty < 0 then return
12030 if tx >=sw or ty>=sh then return
12040 if pic(tx,ty,0) = fbgch AND pic(tx,ty,1) = fbgcl AND pic(tx,ty,2) = fbgbgcl then tflag = 1
12050 return

13000 sub export2clip
13010 out$ = sw ; ", " ; sh ; chr$( 10 )
13020 for y=0 to sh-1: for x=0 to sw-1
13040 out$ = out$ ; ", "; pic(x,y,0) ;", "; pic(x,y,1);", "; pic(x,y,2)
13050 next : out$ = out$ ; chr$( 10 )
13060 next : txtcopy out$: out$ = ""
13070 return

14000 sub loadpic
14010 loaddata "site://picture.csv"
14011 read tw: read th
14015 for y=0 to th-1: for x=0 to tw-1
14020 read v: pic(x,y,0) = v: read v: pic(x,y,1) = v: read v: pic(x,y,2) = v
14030 next: next
14040 return
