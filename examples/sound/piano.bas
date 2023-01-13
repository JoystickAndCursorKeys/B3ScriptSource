0 ch = 2 : reset: volume 0.5 : chvolume ch,1
10 c = cols(): r = rows() : hr = 12: jiffy = 20 : waittime = jiffy
15 color 1,0,0 : cls : fixed = 0
20 if ( c < 62 OR r < 32 ) then fixed = 1 : display 500
25 if fixed=0 then color 0,1  : textarea 62,32: cls
28 dim replay(100)

30 sub initscreen
31 textarea c, hr,0,0: color 0,1 : cls
32 textarea c-2, hr-2,1,1 : color 1,0,26: cls
33 textarea c-4, hr-4,2,2 : color 1,0,26: cls
34 print "Use the keyboard to play piano!"
35 print "Press Escape to exit!"
36 print "Press Tab to record"
37 print "Press Shift to play / stops"
38 print "Press Space to to insert pause (when recording)"
39 kb$="qwertyuiopasdfghjklzxcvbnm"
40 repptr = 0 : rec = 0
41 textarea c, r-hr,0,hr : color 3,20 : cls
42 textarea c-2, r-hr-2,1,hr+1 : color 3,20 : cls

50 sub mainloop
51 getkey a$: if a$ = "" then goto mainloop
52 if a$ = "Tab" then rec = 1 - rec : border 26 + rec
53 if a$ = "Tab" and rec = 1 then repptr = 0: cls : goto mainloop
54 if a$ = "Shift" then rec = 0: gosub playsong: border 26 + rec: goto mainloop
55 if a$ = " " and rec = 1 then replay( repptr ) = 0: repptr = repptr  + 1 : goto mainloop
61 gosub lookup
62 note = 100 + (rv * 10)
63 color 3: print uc$("266a") ;: color 1: print " f=" ; note
64 beep ch, note , 100
65 if rec = 1 then replay( repptr ) = note: repptr = repptr  + 1
66 w=ti + 100
67 if ti < w then goto 67
70 goto mainloop

100 sub lookup
101 rv=0:for t = 1 to len( kb$ )
110 if mid$(kb$,t,1) = a$ then rv = t
140 next
150 return

300 sub playsong
305 border 3 : cls
310 for t=0 to repptr-1
320 w=ti+250
325 if ti<w then goto 325
326 note = replay( t )
330 if note <> 0 then beep ch,replay( t ), 250
335 if note <> 0 then color 3: print uc$("266a") ;: color 1: print " f=" ; replay( t )
340 next
350 cls
400 return
