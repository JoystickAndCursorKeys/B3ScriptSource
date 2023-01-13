0 reset : display 100
200 c = cols(): r = rows() : jiffy = 20 : waittime = jiffy
210 color 1,0,0 : cls : fixed = 0
220 if ( c < 62 OR r < 32 ) then fixed = 1 : display 500
225 if fixed=0 then color 0,1  : textarea 62,32: cls

228 sub main
230 c=60: r=30 :textarea c,r : color 1,20 : cls
240 print
241 center "*** B3 - Sound Effects Demo ***"
242 xoff = 2: yoff = 3 : y=0
250 read itemcnt : for t = 1 to itemcnt
260 read key$: read opt$
270 gosub drawitem : y=y+1
280 next
290 volume .5 : for t=0 to 3: chvolume t, 1: beep t,0,0: next
300 get s$
310 if s$ = "" then goto 300
320 gosub playsound
330 goto 300

500 sub playsound
510 if s$ = "1" then beep 0,400,200
511 if s$ = "2" then beep 1,400,200
513 if s$ = "3" then beep 2,400,200
514 if s$ = "4" then beep 3,400,200
515 if s$ = "b" then gosub bell
516 if s$ = "s" then gosub sirene
517 if s$ = "f" then gosub freqfx
518 if s$ = "g" then gosub freqfx2
519 if s$ = "x" then textarea cols(), rows(): end
599 return
999 end

1000 sub drawitem
1010 locate yoff+y, xoff : print "[";key$;"] - " ; opt$;
1020 return

1500 sub SIRENE
1510 CH = 2
1520 LF =600:HF =1200:FC=0
1540 SETADR CH ,20,20,20
1560 CHSVOLUME CH ,.5
1570 SOUND CH ,400,100000

1600 SUB SIRENEMAIN
1610 GOSUB WAIT
1620 CHFREQ CH ,F
1630 LOCATE  0, 0:PRINT int(F) ;"  "
1640 FC=FC+.01: F=(sin(FC)+2)*200
1650 get a$ : if a$ = "s" then beep ch,0,0: locate 0,0: print "      ": return
1670 GOTO SIRENEMAIN

2000 sub BELL
2010 CH = 2
2040 SETADR CH ,20,350,150
2060 CHSVOLUME CH ,.1
2070 SOUND CH ,1200,100
2075 return

2100 SUB FREQFX
2105 clearfx 0
2110 ADDFX  0,11,840, 0
2120 ADDFX  0,21, 1, 0
2130 ADDFX  0,10,50,100
2140 ADDFX  0,20, 0,100
2170 min=0: max=10: waittime = 200 : gosub PLAYFXSOUND
2180 Beep 0,0,0 : waittime = jiffy : return


2200 SUB FREQFX2
2205 clearfx 0
2210 ADDFX  0,11,50, 0
2220 ADDFX  0,21, 1, 0
2230 ADDFX  0,10,850,100
2240 ADDFX  0,20, 0,100
2270 min=0: max=10: waittime = 200 : gosub PLAYFXSOUND
2280 Beep 0,0,0 : waittime = jiffy : return

3000 SUB PLAYFXSOUND
3010 FOR T = min TO max
3020 WAITTIME =100:GOSUB WAIT
3030 PLAYFX  0,T *50
3040 NEXT
3050 WAITTIME = 300 : GOSUB WAIT : return

9000 SUB WAIT
9010 WF =TI +waittime
9020 IF TI <WF THEN GOTO 9020
9030 RETURN

10000 sub data
10001 data 9
10002 data "1", "Simple Beep Pulse"
10003 data "2", "Simple Beep Saw Tooth"
10004 data "3", "Simple Beep Triangle"
10005 data "4", "Simple Beep Sine Wave"
10006 data "b", "Bell Sound"
10007 data "s", "Sirene Sound, 's' to stop"
10008 data "f", "Frequency Effect"
10009 data "g", "Frequency Effect2"
10100 data "x", "Exit program"

