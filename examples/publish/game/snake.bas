0 reset 
10 SYNCH =20 : VOL = 0.5: DISPLAY 200
15 CLS RESET :IMMEDIATE 1:VOLUME VOL : chvolume 0,1 : chvolume 1,.5
20 SW =COLS ():SH =ROWS ():TAW =80:TAH =32:SBH = 4 : gameover = 0
22 if SW < TAW+2 OR SH < TAH + 2 THEN RESET:  COLOR 1,0,2 : CLS: PRINT: PRINT " TOO LOW RESOLUTION!! " : END
30 DIM LIV$ ( 3) : DIM WALLH(3)
40 DIM SCL ( 2):SCL ( 0)= 5:SCL ( 1)=11
45 DIM LVLC(14): DIM LVFCH(14) : DIM LVLWC(14) : DIM LVLWCC(14) : DIM LVLSTGNAME$(14)
50 COLOR  1, 0, 0:CLS
60 TAX0 =INT ((SW / 2)-(TAW / 2)):TAY0 =INT ((SH / 2)-(TAH / 2))
70 IF TAX0 < 0OR TAY0 < 0THEN COLOR  2, 0, 2:CLS RESET :PRINT "SCREEN TO SMALL!"
80 TEXTAREA TAW ,TAH ,TAX0 ,TAY0
91 WALLH(0) = 532:WALLH(1) = 532:WALLH(2) = 532
92 read stagecount
95 FOR I = 0 TO stagecount-1:
96 READ D : LVLC(I) = D : READ D : LVFCH(I) = D
97 READ D : LVLWC(I) = D
98 READ D: LVLWCC( I ) = D
99 NEXT
100 FOR I = 0 TO stagecount-1: READ D$ : LVLSTGNAME$(  I ) = D$ : NEXT
200 CXWIDTH = width() / cols(): CXHEIGHT = height() / rows():
210 def fn XPOS(x) = CXWIDTH * x
220 def fn YPOS(y) = CXHEIGHT * y
310 drU = 8 : drD = 4 : drL = 2 : drR = 1
311 iuR  = drU + (16 * drR)
312 iuL  = drU + (16 * drL)
313 irD  = drR + (16 * drD)
314 irU  = drR + (16 * drU)
315 ilD  = drL + (16 * drD)
316 ilU  = drL + (16 * drU)
317 idL  = drD + (16 * drL)
318 idR  = drD + (16 * drR)
320 DIM SCHR(256) : FOR T = 0 TO 255 : SCHR( T ) = 65+T: NEXT
321 SCHR( iuR ) = 410
322 SCHR( iuL ) = 411
323 SCHR( irD ) = 411
324 SCHR( irU ) = 413
325 SCHR( ilD ) = 410
326 SCHR( ilU ) = 412
327 SCHR( idL ) = 413
328 SCHR( idR ) = 412
400 DIM modes$(3)
401 modes$(0) = "Easy"
402 modes$(1) = "Medium"
403 modes$(2) = "Hard"
405 mode = 1: modeMax = 2 : topscore = 0 

410 DIM StartSpeeds(3)
412 StartSpeeds( 0 )  = 0.3
413 StartSpeeds( 1 )  = 0.4
414 StartSpeeds( 2 )  = 0.5

420 DIM AccelrPause(3)
422 AccelrPause( 0 )  = 0.001
423 AccelrPause( 1 )  = 0.005
424 AccelrPause( 2 )  = 0.01

430 DIM Acceleration(3)
432 Acceleration( 0 )  = 0.01
433 Acceleration( 1 )  = 0.05
434 Acceleration( 2 )  = 0.1

440 DIM XARR( TAW * TAH ): DIM YARR( TAW * TAH ) : XYAP = 0
450 DIM titleflipcol(2)

1000 SUB MAINLOOP
1010 GOSUB TITLE
1015 IF help = 1 THEN GOSUB HELP : GOTO MAINLOOP
1020 gameover = 0 : GOSUB GAME
1030 GOTO MAINLOOP

1500 SUB SPOOLTOIMAGEDATA
1524 restore: read dummycount
1525 FOR i = 0 TO dummycount-1: READ dummy0: READ dummy1:  READ dummy2: READ dummy3: NEXT
1526 FOR i = 0 TO dummycount-1: READ dummy$ : NEXT
1550 RETURN

1600 SUB SPOOLTOIMAGEDATA2
1624 GOSUB SPOOLTOIMAGEDATA
1625 REM And now read imagedata1
1627 read dummyw: read dummyh
1628 for dummyy=0 to dummyh-1: for dummyx=0 to dummyw-1
1629 read dummy0: read dummy1: read dummy2
1631 next: next
1650 RETURN

1700 SUB SPOOLTOIMAGEDATA3
1724 GOSUB SPOOLTOIMAGEDATA2
1725 REM And now read imagedata2
1727 read dummyw: read dummyh
1728 for dummyy=0 to dummyh-1: for dummyx=0 to dummyw-1
1729 read dummy0: read dummy1: read dummy2
1731 next: next
1750 RETURN

1800 SUB SPOOLTOIMAGEDATA4
1824 GOSUB SPOOLTOIMAGEDATA3
1825 REM And now read imagedata3
1827 read dummyw: read dummyh
1828 for dummyy=0 to dummyh-1: for dummyx=0 to dummyw-1
1829 read dummy0: read dummy1: read dummy2
1831 next: next
1850 RETURN

2000 SUB TITLE
2001 help = 0: prevMode = mode
2002 textarea cols(), rows(), 0 , 0
2003 color 5,0: cls
2004 TEXTAREA TAW+2 ,TAH+2 ,TAX0-1 ,TAY0-1
2005 color 5,2: cls
2006 TEXTAREA TAW ,TAH ,TAX0 ,TAY0
2020 color 1,0: CLS
2021 GOSUB SPOOLTOIMAGEDATA
2027 read tpw: read tph : tpxo = tax0+15: tpyo = tay0+1
2028 for tpy=0 to tph-1: for tpx=0 to tpw-1
2029 read tpch: read tpcol: read tpbg
2030 pokeccl tpx+tpxo,tpy+tpyo,tpch,tpcol,tpbg
2031 next: next
2040 scrollfx = 0 : scrollfxmax = 1 : scrollflip = 0 : titleflipcol(0) = 1  : titleflipcol(1) = 2 : scrollfxmaxinc = 0
2050 LOCATE INT ( 16 ), 0 : if gameover = 1 THEN LOCATE INT ( 13 ), 0 
2051 color 1,0: CENTER "Snake B3":PRINT 
2052 if gameover = 1 then  COLOR  2,0 : CENTER "Game  Over": PRINT
2053 if gameover = 1 then  COLOR  11,0 : CENTER "Score: " ; int( SC ) ; " " ; modes$( prevMode) ; " L" ; int( Level )
2054 if gameover = 1 then  COLOR  11,0 : CENTER "Top Score ";topscore :PRINT
2060 LOCATE 27,0: COLOR  8,0:  CENTER "  '" ; modes$( mode);"'  "
2065 COLOR  8,0: CENTER "<<h>> for Help" 
2070 COLOR  5,0:  CENTER "Press <<Space>> to Start" ;
2100 GOSUB TITLEFX : WAITMS 50
2101 scrollfxmaxinc = scrollfxmaxinc + 1 
2102 IF scrollfxmaxinc > 200 THEN scrollfxmaxinc = 0 : scrollfx = 0 : scrollfxmax = scrollfxmax + 1 : if scrollfxmax > 4 THEN scrollfxmax = 2
2105 GET K$
2110 changeMode = 0: IF K$ = "d" OR K$ = "D" then changeMode = 1
2115 if changeMode = 1 then mode = mode + 1: if mode > modeMax then mode = 0
2116 if changeMode = 1 then GOTO 2060
2117 IF K$ = "h" then help = 1: RETURN
2120 if k$ <> " " then goto 2100
2130 RETURN


2200 SUB HELP
2201 prevMode = mode
2202 textarea cols(), rows(), 0 , 0
2203 color 5,0: cls
2204 TEXTAREA TAW+2 ,TAH+2 ,TAX0-1 ,TAY0-1
2205 color 5,2: cls
2206 TEXTAREA TAW ,TAH ,TAX0 ,TAY0
2220 color 1,0: CLS
2240 scrollfx = 0 : scrollfxmax = 1 : scrollflip = 0 : titleflipcol(0) = 1  : titleflipcol(1) = 15 : scrollfxmaxinc = 0
2250 LOCATE INT ( 3 ), 0 
2251 color 5,0: CENTER "- HELP - ": PRINT  : PRINT
2254 COLOR  8,0: CENTER "Snake B3 is written in B3 Basic" : PRINT : 
2255 CENTER "This game is Keyboard only" : PRINT : PRINT: PRINT: COLOR  1,0
2260 CENTER "Spacebar - Start or continue    " : PRINT: PRINT
2270 COLOR  11,0 : CENTER "-- Title Screen -- " : PRINT : COLOR  1,0
2271 CENTER "d: Change difficulty level      ": PRINT
2272 CENTER "h: Show this help               " : PRINT: PRINT
2280 COLOR  11,0 : CENTER "-- Game Controls --" : PRINT : COLOR  1,0
2281 CENTER "Cursor Keys - Control your Snake" : PRINT
2282 CENTER "'WASD'      - Control your Snake" : PRINT
2283 CENTER "'x' and 'q' - Quit the game     " : PRINT
2300 GOSUB TITLEFX : WAITMS 50
2301 scrollfxmaxinc = scrollfxmaxinc + 1 
2302 IF scrollfxmaxinc > 200 THEN scrollfxmaxinc = 0 : scrollfx = 0 : scrollfxmax = scrollfxmax + 1 : if scrollfxmax > 4 THEN scrollfxmax = 2
2305 GET K$
2320 if k$ <> " "  then goto 2300
2330 RETURN


2500 SUB TITLEFX
2510 X0 = TAX0-1: Y0 = TAY0 -1 : X1 = TAX0 + TAW: Y1 =  TAY0 + TAH : CH = 374 : scrollfx0 = scrollfx : scrollflip0 = scrollflip
2520 FOR X = X0 to X1 : GOSUB TITLEFXFLIP : POKECCL X,Y0 , CH, titleflipcol( scrollflip0 ),0 : NEXT
2525 FOR Y = Y0 to Y1 : GOSUB TITLEFXFLIP : POKECCL X1,Y , CH, titleflipcol( scrollflip0 ),0 : NEXT
2530 FOR X = X1 to X0 STEP -1 : GOSUB TITLEFXFLIP : POKECCL X,Y1 , CH, titleflipcol( scrollflip0 ),0 : NEXT
2535 FOR Y = Y1 to Y0 STEP -1 : GOSUB TITLEFXFLIP : POKECCL X0,Y , CH, titleflipcol( scrollflip0 ),0 : NEXT
2540 scrollfx = scrollfx + 1
2545 if( scrollfx > scrollfxmax ) then scrollfx = 0 : scrollflip = 1 - scrollflip
3555 RETURN

2600 SUB TITLEFXFLIP
2610 scrollfx0 = scrollfx0 + 1
2620 if( scrollfx0 > scrollfxmax ) then scrollfx0 = 0 : scrollflip0 = 1 - scrollflip0
2625 RETURN


3000 SUB GAME
3010 WALL =528:HRTH =287:CLOVER =9827: STARCH0 = 608: STARCH1 =  609:  GOALCH0=389 : GOALCHA0=390 : goalch = 296
3011 KEY0 = 480: KEY1 = 294: KEY2=352 : DOOR0 = 516: DOOR1 = 517: PILL0 = 481: PILL1 = 482 
3015 DIETPILL0 =481 : DIETPILL1=482 : SNAKE = 286 
3016 endgame = 0 : TWARNLVL=2.5 : Level = 0 : XYAP = 0 : XYSAP = 0
3017 textarea cols(), rows(), 0 , 0
3018 color 5,0,0: cls
3020 GOSUB DRAWLEVEL
3030 TEXTAREA TAW ,SBH ,TAX0 ,TAY0 :COLOR  1, 0:CLS
3035 GOSUB UPDATELEVELINDICATOR
3040 SC = 0:FLIP0=0:FLIP = 0:DC = 0 : Level = 0
3060 LIVES = 3
3070 LIV$ ( 3)=UC$ (HRTH );UC$ (HRTH );UC$ (HRTH )
3080 LIV$ ( 2)=UC$ (HRTH );UC$ (HRTH );" "
3090 LIV$ ( 1)=UC$ (HRTH );"  "
3100 REM RESUME NEXT LEVEL OR NEXT LIVE
3101 XYAP = 0 : XYSAP = 0 : GOSUB LIVESTATUS
3102 X =INT (TAW / 2):Y =INT (TAH / 2):XD = 0:YD = 1
3103 XI =INT (X ):YI =INT (Y ):LXI =XI :LYI =YI : YF=.6: XF=1 : SPC = 0
3104 SPF = StartSpeeds( mode )    :   REM ---- DIFFICULTY
3105 SPCI = AccelrPause( mode )   :   REM ---- DIFFICULTY
3106 XSP =  1 * SPF :YSP =YF * SPF
3107 CD = 10: CDS = .01 : GOSUB DRAWTIMER
3108 IF gameover = 1 then IF int( SC ) > topscore then topscore = int( SC ) 
3109 IF gameover = 1 OR endgame = 1 then RETURN
3110 GOSUB CALCULATESTAGE
3111 REM  -- -- -- CLEAR RECTANGLE AROUND PLAYER FROM WALLS -- -- -- --
3112 for cly = yi-4 to yi+4
3113 for clx = xi-5 to xi+5
3114  CH = PEEKC( TAX0 +clx, TAY0 +cly )
3115  GOCLEAR = 0
3116  IF CH <> STARCH0 AND CH <> STARCH1 AND CH <> KEY0 AND CH <> KEY1 AND CH <> KEY2 THEN GOCLEAR = 1
3117  IF GOCLEAR = 1 THEN POKECCL TAX0 +clx ,TAY0 +cly ,LVFCHR,0,LVLC(STAGEIX)
3118 next:next
3120 OLDXI = -999: OLDYI = -999: LASTSC = -1 : SNKCOL = SCL (FLIP )  
3125 RSYNCH : REM Synchronize renderer when we start to play again.
3130 REM -- -- -- -- -- -- -- -- -- -- -- --  GAMELOOP -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
3135 SPC = SPC + SPCI: IF SPC > 1 THEN SPC = 0 : GOSUB GOFASTER
3145 IF OLDXI <> XI OR OLDYI <> YI THEN POKECCL TAX0 +XI ,TAY0 +YI ,SNAKE ,SNKCOL, SNKCOL 
3146 IF OLDXI <> XI OR OLDYI <> YI THEN XARR(XYAP) = TAX0+XI:  YARR(XYAP) = TAY0+YI: XYAP= XYAP + 1 : OLDXI = XI: OLDYI = YI
3150 GETKEY KEY$
3160 if key$ <> "" then gosub HANDLEKEYS
3200 GOSUB MOVEPLAYER
3205 if nextlev = 1 then gosub NEXTLEVEL : SC = SC + 100: GOSUB REDRAWINGAME : goto 3100
3210 IF die OR endgame = 1 then goto 3100
3300 waitms 20
3310 SC =SC + .1: IF INT(SC) <> LASTSC THEN COLOR 1:LOCATE  0, 1:PRINT ""; pad$( str$( int( sc ), 10, 0), "0", 6 ): LASTSC = int(SC)
3315 LASTCD = CD : CD=CD-CDS 
3316 IF( CD > TWARNLVL AND INT(LASTCD ) <> INT(CD))  THEN six = 1: gosub sound
3317 IF( CD <= TWARNLVL ) THEN IF( INT(LASTCD * 4) <> INT(CD  * 4))  THEN six = 1: gosub sound
3319 GOSUB DRAWTIMER
3320 GOTO 3130
3330 END

3400 SUB HANDLEKEYS
3401 pXD = XD : pYD = YD
3402 IF KEY$ ="w" OR KEY$ = "ArrowUp" AND YD=0 THEN YD =- 1:XD = 0 :  gosub CHANGEDIRECTION
3403 IF KEY$ ="s" OR KEY$ = "ArrowDown" AND YD=0 THEN YD = 1:XD = 0 :  gosub CHANGEDIRECTION
3404 IF KEY$ ="a" OR KEY$ = "ArrowLeft" AND XD=0 THEN XD =- 1:YD = 0 :  gosub CHANGEDIRECTION
3405 IF KEY$ ="d" OR KEY$ = "ArrowRight" AND XD=0 THEN XD = 1:YD = 0 :  gosub CHANGEDIRECTION
3406 endgame = 0 : IF KEY$ ="x" OR KEY$ ="q" THEN endgame = 1
3440 RETURN

3450 SUB CHANGEDIRECTION
3452 tmpLastDir = 0 : tmpCurDir = 0
3453 IF pXD = 1 THEN tmpLastDir = drR
3454 IF pXD = -1 THEN tmpLastDir = drL
3455 IF pYD = 1 THEN tmpLastDir = drD
3456 IF pYD = -1 THEN tmpLastDir = drU
3457 IF XD = 1 THEN tmpCurDir = drR
3458 IF XD = -1 THEN tmpCurDir = drL
3459 IF YD = 1 THEN tmpCurDir = drD
3460 IF YD = -1 THEN tmpCurDir = drU
3465 CDIX = tmpLastDir + (16 * tmpCurDir)
3466 SNKCHR = SCHR( CDIX )
3467 OLDC = PEEKCL( TAX0 +XI ,TAY0 +YI, 0 )
3470 POKECCL TAX0 +XI ,TAY0 +YI , SNKCHR, OLDC, LVLC(STAGEIX)
3471 SIX=0 : GOSUB SOUND
3472 RETURN

3500 SUB MOVEPLAYER
3510 X =X +(XD *XSP )
3520 Y =Y +(YD *YSP )
3525 LXI =XI :LYI =YI :XI =INT (X ):YI =INT (Y )
3527 OXYSAP = INT(XYSAP): XYSAP = XYSAP + (XSP * .2)
3528 IF OXYSAP <> INT ( XYSAP ) THEN pokeccl XARR( OXYSAP ), YARR( OXYSAP ), LVFCHR,0, LVLC(STAGEIX) 
3530 MOVED = 0: IF LXI <>XI OR LYI <>YI THEN MOVED = 1: FLIP0 = 1-FLIP0: IF FLIP0 = 0 then FLIP = 1 - FLIP : SNKCOL = SCL (FLIP )
3540 DIE=0: nextlev = 0: IF MOVED = 1 THEN GOSUB TESTPLAYER
3550 IF DIE = 1THEN GOSUB PLAYERDIE
3580 if nextlev = 1 then POKECCL TAX0 +XI ,TAY0 +YI ,SNAKE ,SNKCOL, SNKCOL
3582 if nextlev = 1 then xi=xi + XD : flip = 1-flip : POKECCL TAX0 +XI ,TAY0 +YI ,SNAKE ,SNKCOL, SNKCOL
3583 if nextlev = 1 then RETURN
3595 X =RANGE (X , 0,TAW - 1):Y =RANGE (Y , 0,TAH - 1)
3599 RETURN

3600 SUB CALCULATESTAGE
3610 STAGEIX = INT(Level / 3) % stagecount
3611 NEXTSTAGEIX = INT((Level +1)/ 3) % stagecount
3612 LASTLEVELInSTG = 0: IF STAGEIX <> NEXTSTAGEIX THEN LASTLEVELInSTG = 1
3620 RETURN

3700 SUB GOFASTER
3710 SPF = SPF + Acceleration( mode )  : REM DIFFICULTY ---
3711 SPF = RANGE( SPF, 0, 1)
3715 XSP =  1 * SPF :YSP =YF * SPF
3716 PSPF = INT(SPF*10)
3725 IF PSPF = LSPF THEN RETURN
3740 LSPF = PSPF
3750 RETURN

3800 SUB UPDATELEVELINDICATOR
3820 LVL$ = "Lvl" ; Level ; " ("; modes$(mode) ;")"
3821 STG$ = "'" ; LVLSTGNAME$( STAGEIX )+"'"
3830 TEXTAREA TAW ,TAH ,TAX0 ,TAY0
3840 LOCATE  0,0: COLOR  11, 0 : CENTER LVL$
3841 LOCATE  1,0: COLOR  5, 0 : CENTER STG$
3850 RETURN

3900 SUB DRAWTIMER
3910 LIW = INT((TAW-2) * (CD/10)) : LIW2 = TAW-LIW
3920 FOR T=1 TO TAW-2
3930 TCH = 498 : TCC = 14
3940 if LIW >T then TCH = 496
3945 IF T<15 then tcc = 5
3946 IF T<10 then tcc = 11
3947 IF T<5 then tcc = 2
3950 pokeccl t+TAX0,2+TAY0,tch, TCC,0
3960 next
3970 RETURN

4000 SUB DRAWLEVEL
4001 TEXTAREA TAW ,TAH ,TAX0 ,TAY0  : HH = TAH-SBH: WW = TAW
4005 GOSUB CALCULATESTAGE : LVFCHR = LVFCH( STAGEIX )
4010 COLOR  LVLWC(STAGEIX), LVLC(STAGEIX):CLS
4015 FOR X=TAX0 TO TAX0+TAW-1: FOR Y=TAY0 TO TAY0+TAH-1
4016  POKECCL X,Y, LVFCHR,0,LVLC(STAGEIX)
4017 NEXT: NEXT
4020 REM  -- -- -- -- -- -- OUTER WALLS -- -- --  -- -- -- --
4021 SPW =WIDTH ():SPH =HEIGHT ()
4060 FOR TX = 0TO TAW - 1
4065  CH = WALLH( TX % 3)
4070  POKECCL TAX0 +TX ,TAY0 +SBH ,CH,LVLWC(STAGEIX),LVLWCC(STAGEIX) :POKECCL TAX0 +TX ,TAY0 +TAH - 1, CH,LVLWC(STAGEIX),LVLWCC(STAGEIX)
4080 NEXT
4090 FOR TY =SBH TO TAH - 1
4095  CH = WALLH( TY % 3)
4100  POKECCL TAX0 ,TAY0 +TY ,CH,LVLWC(STAGEIX),LVLWCC(STAGEIX) :POKECCL TAX0 +TAW - 1,TAY0 +TY ,CH,LVLWC(STAGEIX),LVLWCC(STAGEIX)
4110 NEXT
4115 REM  -- -- -- -- -- -- DOOR (DOOR POSTS) -- -- --  -- -- -- --
4120 LHEIGHT = TAH-2-7 : Y = INT(RND(0)*LHEIGHT) + TAY0 + 3
4125 X=TAX0 +TAW - 2 : X2 = X+1 : GC0 = GOALCH0: GC1 = GOALCH
4126 if Level % 2 = 0 then x = TAX0: x2 = x+1 : GC0 = GOALCH: GC1 = GOALCHA0
4130 POKECCL X2, Y, WALL, LVLWC(STAGEIX), LVLWCC(STAGEIX): POKECCL X, Y, WALL, LVLWC(STAGEIX),LVLWCC(STAGEIX)
4135 POKECCL X2, Y+5, WALL, LVLWC(STAGEIX), LVLWCC(STAGEIX) : POKECCL X, Y+5, WALL, LVLWC(STAGEIX),LVLWCC(STAGEIX)
4140 Y=Y+1
4145 REM  -- -- -- -- -- -- DOOR (GOAL CHARS) -- -- --  -- -- -- --
4146 GOALX2 = X2: GOALX1 = X: GOALY0 = Y : GOALGC0 = GC0: GOALGC1 = GC1: GOALCOL1 = 14: GOALCOL2 = LVLC(STAGEIX)
4150 FOR TY=0 TO 3
4155  IF LASTLEVELInSTG = 0 THEN POKECCL X2,Y+TY,GC0,14,LVLC(STAGEIX): POKECCL X,Y+TY,GC1,14,LVLC(STAGEIX)
4156  IF LASTLEVELInSTG = 1 THEN POKECCL X2,Y+TY,DOOR0,12,28: POKECCL X,Y+TY,DOOR1,12,28
4160 NEXT
4190 REM  -- -- -- -- -- -- OBSTACLE WALLS -- -- --  -- -- -- --
4200 Y=Y-2
4205 X = TAW - 10 : if Level % 2 = 0 then X = 13
4210 FOR YY=0 to 6 : POKECCL X, YY + Y, WALL, LVLWC(STAGEIX),LVLWCC(STAGEIX) : NEXT
4300 WL = 7: LHEIGHT = TAH-2-(2*WL) : LWIDTH = TAW-2-(2*WL)
4305 FOR T = 0 TO LEVEL
4310  Y = INT(RND(0)*LHEIGHT) + TAY0 + WL
4315  X = INT(RND(0)*LWIDTH) + TAX0 + WL
4320  IF T % 2 = 1 THEN FOR YY=0 to WL-1 : POKECCL X,    YY + Y, WALL, LVLWCC(STAGEIX), LVLWC(STAGEIX) : NEXT
4325  IF T % 2 = 0 THEN FOR XX=0 to WL-1 : POKECCL XX+X, Y,      WALL, LVLWCC(STAGEIX), LVLWC(STAGEIX) : NEXT
4330 NEXT
4414 REM  -- -- -- -- -- -- STARS -- -- --  -- -- -- --
4415 for t = 0 to Level
4416 sxx = INT(rnd(0)*(WW-3))+TAX0+1: syy= INT(rnd(0)*(HH-2))+TAY0 + SBH + 1
4420 CH0 = PEEKC( sxx, syy ): CH1 = PEEKC( sxx+1, syy )
4430 IF CH0 = LVFCHR AND CH1 = LVFCHR THEN pokeccl sxx, syy, STARCH0, 5
4431 IF CH0 = LVFCHR AND CH1 = LVFCHR THEN pokeccl sxx+1, syy, STARCH1, 5
4449 next
4500 REM -- -- -- -- -- -- KEY -- -- --  -- -- -- --  
4501 IF LASTLEVELInSTG = 0 THEN GOTO 4600 
4505 REM LOOP RETRY
4510 sxx = INT(rnd(0)*(WW-4))+TAX0+1: syy= INT(rnd(0)*(HH-2))+TAY0 + SBH + 1
4511 CH0 = PEEKC( sxx, syy ): CH1 = PEEKC( sxx+1, syy ) : CH2 = PEEKC( sxx+2, syy )
4512 CHOK =0 : IF CH0 = LVFCHR AND CH1 = LVFCHR AND CH2 = LVFCHR THEN CHOK = 1
4513 IF CHOK=1 THEN pokeccl sxx, syy, KEY0, 5: pokeccl sxx+1, syy, KEY1, 5 : pokeccl sxx+2, syy, KEY2, 5
4514 IF CHOK=0 THEN goto 4505
4600 REM SKIP KEYS
4601 IF Level < 4 THEN GOTO 4700 
4610 REM -- -- -- -- -- -- Diet Pills -- -- --  -- -- -- --
4605 REM LOOP RETRY
4610 sxx = INT(rnd(0)*(WW-4))+TAX0+1: syy= INT(rnd(0)*(HH-2))+TAY0 + SBH + 1
4611 CH0 = PEEKC( sxx, syy ): CH1 = PEEKC( sxx+1, syy ) 
4612 CHOK =0 : IF CH0 = LVFCHR AND CH1 = LVFCHR  THEN CHOK = 1
4613 IF CHOK=1 THEN pokeccl sxx, syy, DIETPILL0, 6: pokeccl sxx+1, syy, DIETPILL1, 6 
4615 IF CHOK=0 THEN goto 4605

4700 RETURN RETURN

5000 SUB TESTPLAYER
5010 DIE = 0 : NEXTLEV = 0 : YB = YI +TAY0 : XB = XI + TAX0
5015 IF CD <= 0 then DIE = 1: RETURN
5020 IF (LXI =XI AND LYI =YI )THEN RETURN
5025 PCHAR = PEEKC (XB ,YB )
5026 IF PCHAR = LVFCHR THEN  RETURN
5027 LVLCOL =  LVLC(STAGEIX)
5030 IF PCHAR = GOALCH THEN NEXTLEV = 1 : RETURN
5035 IF PCHAR = STARCH0 THEN SC=SC+200 :  GOSUB sndstar : POKECCL XB + 1 ,YB, LVFCHR, 0,LVLCOL: RETURN
5036 IF PCHAR = STARCH1 THEN SC=SC+200 :  GOSUB sndstar : POKECCL XB - 1 ,YB, LVFCHR, 0,LVLCOL: RETURN
5037 CHRISKEY = 0
5038 IF PCHAR = KEY0 THEN CHRISKEY = 1 :  POKECCL XB + 1 ,YB, LVFCHR, 0,LVLCOL: POKECCL XB + 2 ,YB, LVFCHR, 0,LVLCOL 
5039 IF PCHAR = KEY1 THEN CHRISKEY = 1 :  POKECCL XB - 1 ,YB, LVFCHR, 0,LVLCOL: POKECCL XB + 1 ,YB, LVFCHR, 0,LVLCOL 
5040 IF PCHAR = KEY2 THEN CHRISKEY = 1 :  POKECCL XB - 1 ,YB, LVFCHR, 0,LVLCOL: POKECCL XB - 2 ,YB, LVFCHR, 0,LVLCOL 
5045 IF CHRISKEY = 1 THEN GOSUB OPENDOOR:  RETURN

5050 CHRISPILL = 0
5051 IF PCHAR = DIETPILL0 THEN CHRISPILL=1: POKECCL XB+1,YB, LVFCHR,0,LVLCOL : POKECCL XB,YB, LVFCHR,0,LVLCOL
5052 IF PCHAR = DIETPILL1 THEN CHRISPILL=1: POKECCL XB-1,YB, LVFCHR,0,LVLCOL : POKECCL XB,YB, LVFCHR,0,LVLCOL
5055 IF CHRISPILL = 1 THEN :  GOSUB sndpill: GOTO shrinksnake:  RETURN

5089 IF PCHAR<>LVFCHR THEN DIE = 1 : RETURN
5090 return

5100 SUB REDRAWINGAME
5110 TEXTAREA TAW ,TAH ,TAX0 ,TAY0 : gosub DRAWLEVEL
5120 TEXTAREA TAW ,SBH ,TAX0 ,TAY0 :COLOR  1, 0:CLS : gosub LIVESTATUS
5130 GOSUB UPDATELEVELINDICATOR
5140 RETURN

5500 SUB NEXTLEVEL
5501 c1 = LVLWC(STAGEIX): c2 = LVLWCC(STAGEIX)
5505 Level = Level + 1 
5527 OLVI = STAGEIX: GOSUB CALCULATESTAGE : NLVI = STAGEIX
5531 IF OLVI = NLVI THEN GOSUB sndnextlevel   : GOSUB clearscreeneffect2 : GOSUB clrwallarea : COLOR  14, 0
5532 IF OLVI <> NLVI THEN GOSUB sndnextstage  : GOSUB nextstageeffect    : COLOR  1, 0
5533 TEXTAREA TAW ,TAH ,TAX0 ,TAY0
5535 IF OLVI <> NLVI THEN LOCATE INT (ROWS ()/ 2)-2, 0 :  CENTER "Entering '"  + LVLSTGNAME$( STAGEIX ) + "'" : PRINT : PRINT
5536 IF OLVI <> NLVI THEN  COLOR 5: CENTER "<<Press Space>>"
5540 IF OLVI = NLVI THEN  LOCATE INT (ROWS ()/ 2)-5, 0 
5541 IF OLVI = NLVI THEN  COLOR 19: CENTER "Entering Level "  + Level
5542 IF OLVI = NLVI THEN  COLOR 19: CENTER "Entering Level "  + Level
5543 IF OLVI = NLVI THEN  COLOR 3: CENTER "Entering Level "  + Level
5544 IF OLVI = NLVI THEN  COLOR 3: CENTER "Entering Level "  + Level
5545 IF OLVI = NLVI THEN  COLOR 14: CENTER "Entering Level "  + Level
5546 IF OLVI = NLVI THEN  COLOR 14: CENTER "Entering Level "  + Level : PRINT
5547 IF OLVI = NLVI THEN  COLOR 5: CENTER "<<Press Space>>"
5548 GOSUB WAITKEY
5550 RETURN


5600 SUB nextstageeffect
5605 GOSUB clearscreeneffect1
5616 GOSUB SPOOLTOIMAGEDATA4
5620 read tpw: read tph
5621 tpxo = tax0+31 : tpyo = tay0 + 6
5623 for tpy=0 to tph-1: for tpx=0 to tpw-1
5624 read tpch: read tpcol: read tpbg
5625 pokeccl tpx+tpxo,tpy+tpyo,tpch,tpcol,tpbg
5626 next: next
5627 RETURN


5700 SUB OPENDOOR
5710 gosub sndkey
5750 FOR TY=0 TO 3
5755  POKECCL GOALX2 , GOALY0+TY, GOALGC0, GOALCOL1,GOALCOL2
5756  POKECCL GOALX1 , GOALY0+TY, GOALGC1, GOALCOL1,GOALCOL2
5760 NEXT
5799 RETURN

5800 SUB clrwallarea
5805 TAW3 = INT( TAW/3 ): TAH3 = INT( (TAH-SBH)/3 )
5810 FOR X=TAX0 + TAW3 TO (TAX0+TAW)-TAW3
5820 FOR Y=TAY0 + TAH3 + SBH TO (TAY0 + TAH) - TAH3 - 1
5830  POKECCL X,Y, 32,1,0
5840 NEXT: NEXT
5890 RETURN

6000 SUB PLAYERDIE
6005 LIVES =LIVES - 1: IF LIVES = 0 THEN gameover = 1
6010 TEXTAREA TAW ,TAH ,TAX0 ,TAY0
6011 if gameover = 0 then GOSUB snddie      
6012 if gameover = 1 then GOSUB sndgameover 
6013 GOSUB removesnake
6014 if gameover = 0 then WAITMS 400
6015 if gameover = 1 then WAITMS 1000

6016 GOSUB clearscreeneffect1
6017 if gameover = 0 then GOSUB SPOOLTOIMAGEDATA2
6018 if gameover = 1 then GOSUB SPOOLTOIMAGEDATA3
6020 read tpw: read tph
6021 if gameover = 0 then tpxo = tax0+29 : tpyo = tay0 + 1
6022 if gameover = 1 then tpxo = tax0+32 : tpyo = tay0 + 3
6023 for tpy=0 to tph-1: for tpx=0 to tpw-1
6024 read tpch: read tpcol: read tpbg
6025 pokeccl tpx+tpxo,tpy+tpyo,tpch,tpcol,tpbg
6035 next: next
6040 COLOR  1
6045 y0 = INT (ROWS ()/ 2)- 2 : LOCATE y0, 0
6050 if gameover = 0 then CENTER "     1 Live Lost     ": PRINT
6055 if gameover = 1 then COLOR 5: CENTER "     Game Over     ": PRINT : COLOR 1
6060 CENTER " Your Score:  ";pad$( int( SC );"", "0", 6, 1);"  ": PRINT
6065 if gameover = 0 then COLOR  5,0:  CENTER "<<Press Space>>" ;
6070 if gameover = 0 then GOSUB WAITKEY
6075 if gameover = 1 then for t = 9 to 0 step -1 : locate y0 + 4: CENTER "";t : WAITMS 400 : NEXT
6080 if gameover = 0 then GOSUB REDRAWINGAME
6085 FOR t = 1 TO 100: GETKEY dummy$ :  NEXT
6090 RETURN

6500 SUB removesnake
6510 wwm = int( XYAP/10) : ww = wwm: FOR t = INT(XYSAP) to XYAP-1
6520 pokeccl XARR(t), YARR(t), LVFCHR,0, LVLC(STAGEIX)
6530 ww=ww-1 : if ww <0 then ww = wwm : waitms 100
6535 next
6540 return

6600 SUB shrinksnake
6610 wwm = int( XYAP/10) : ww = wwm: FOR t = INT(XYSAP) to XYAP-1
6620 pokeccl XARR(t), YARR(t), LVFCHR,0, LVLC(STAGEIX)
6635 next : XYSAP = t
6640 return

7000 SUB WAITKEY
7010 GET K$ : waitms 75
7020 IF K$ <>" "THEN GOTO 7010
7030 RETURN

8000 SUB LIVESTATUS
8010 LOCATE  0,TAW - 4:COLOR  2, 0:PRINT LIV$ (LIVES );
8020 RETURN

9500 SUB WAIT
9510 waitms 5 : rem SYNCH
9530 RETURN

10000 sub sound
10010 if six = 0 then chvolume 0,.5: BEEP  1,50,70 : return
10020 if six = 1 then chvolume 0,.5: BEEP  0,930,70 : return
10900 reset : cls : print "unknown sound " ; six : end

15000 sub sndnextlevel
15001 ch = 2
15010 volume .5: chvolume ch,1: clearfx ch : f = 30: sh = 18
15100 for r = 0 to 25
15110 ADDFX  ch,11,r*1000, r*f
15120 ADDFX  ch,21, 1, r*f
15130 ADDFX  ch,10,r*50 ,r*f + sh
15150 next
15160 ADDFX  ch,21, 0,(r+1)*f
15200 playfx ch
15300 return

16000 sub sndnextstage
16001 ch = 2
16010 volume .5: chvolume ch,1: clearfx ch : f = 100: sh = 80
16100 for r = 0 to 50 step 1: r2=50-r
16110 ADDFX  ch,11,r2*11, r*f
16120 ADDFX  ch,21, 1, r*f
16130 ADDFX  ch,10,r*10 ,r*f + sh
16150 next
16160 ADDFX  ch,21, 0,(r)*f + (sh*2)
16200 playfx ch
16300 return

17000 sub snddie
17001 ch = 3
17010 volume .5: chvolume ch,1: clearfx ch : f = 10: sh = 8
17100 for r = 0 to 50 step 1: r2=50-r
17110 ADDFX  ch,11,r2*31, r*f
17120 ADDFX  ch,21, 1, r*f
17130 ADDFX  ch,10,r2*5 ,r*f + sh
17150 next
17160 ADDFX  ch,21, 0,(r)*f + (sh*2)
17200 playfx ch
17201 return

18000 sub sndgameover
18001 ch = 2
18010 volume .5: chvolume ch,1: clearfx ch : f = 30: sh = 18
18100 for r = 0 to 50
18110 ADDFX  ch,11,int(rnd()*1000), r*f
18120 ADDFX  ch,21, 1, r*f
18130 ADDFX  ch,10,int(rnd()*1000),r*f + sh
18150 next
18160 ADDFX  ch,21, 0,(r+1)*f
18200 playfx ch
18201 return

19000 sub sndstar
19001 ch = 2
19010 volume .5: chvolume ch,1: clearfx ch : f = 3: sh = 8
19100 for r = 10 to 60 step 10: r2=50-r
19110 ADDFX  ch,11,r*61, r*f
19120 ADDFX  ch,21, 1, r*f
19130 ADDFX  ch,10,r*20 ,r*f + sh
19150 next
19160 ADDFX  ch,21, 0,(r)*f + (sh*2)
19200 playfx ch
19201 return


19300 sub sndpill
19301 ch = 2
19310 volume .5: chvolume ch,1: clearfx ch : f = 7: sh = 8
19315 for r = 10 to 80 step 7: r2=50-r
19320 ADDFX  ch,11,r*61, r*f
19325 ADDFX  ch,21, 1, r*f
19330 ADDFX  ch,10,r*20 ,r*f + sh
19350 next
19360 ADDFX  ch,21, 0,(r)*f + (sh*2)
19370 playfx ch
19380 return



19500 sub sndkey
19505 ch = 2
19510 volume .5: chvolume ch,1: clearfx ch : f = 5: sh = 4
19515 for v=0 to 2
19520 for r = 0 to 25 step 3: r2=50-r
19525 d = (r*f) + (26*v*f)
19530 ADDFX  ch,11,r*26, d
19535 ADDFX  ch,21, 1, d
19540 ADDFX  ch,10,r*200 ,d + sh
19545 next
19550 next
19555 ADDFX  ch,21, 0,d + (sh*2)
19560 playfx ch
19600 RETURN 

20000 sub clearscreeneffect1
20001 immediate 0
20010 HH = TAH - SBH: CFXY0 = TAY0 + SBH : c = 0 : flip=1
20050 for x0 = 0 to int((TAW-1)/2) : x1 = x0 + TAX0 : x2 = ((TAX0 + TAW ) - 1) - x0
20055 for y = TAY0 to TAY0 + (TAH - 1)
20060 pokeccl x1,y,32,1,0 : pokeccl x2,y,32,1,0
20061 c=c+1%32 : border c
20065 next
20070 flip=1-flip: if flip then waitms 10
20075 next
20080 immediate 1
20090 return

20100 sub clearscreeneffect2
20101 immediate 0
20110 HH = TAH - SBH: CFXY0 = TAY0 + SBH
20120 for y0 = 0 to INT( HH / 2) : y1 = y0 + CFXY0: y2 = (CFXY0 + HH - 1 )  - y0
20125 for x = TAX0 to TAX0 + (TAW ) - 1
20130 pokeccl x,y1,532, c1, c2
20131 pokeccl x,y2,532, c1, c2
20135 next
20140 waitms 10
20145 next
20180 immediate 1
20190 return

50000 sub data
50049 data 14  : REM stages   levelcolor, levelbgchar,  wallcolor, wallbgcolor
50050 data 20,536,6,26,  23,524,7,8,   0,32,1,8,   4,460,6,9,   10,534,11,8,   0,405,4,10  ,   12,420,13,8
50051 data 20,358,6,26,  23,527,7,8,   0,32,7,8,   20,364,4,0,   10,460,10,8,   20,534,4,10  ,   12,405,12,11
50052 data "Beginners Luck", "Purple Maze", "Dark Caverns",  "Asylum", "Orange Castle", "Shady Places", "Classic Oak"
50053 data "Halfway Point",  "Neon City", "Neon Glow", "Blue Moon", "Industrial", "The Blues", "Oak House"
51000 data 48, 26
51010 data  32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0
51020 data  32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 490, 1, 0, 491, 1, 0, 492, 1, 1, 492, 1, 0, 493, 1, 0, 32, 1, 0, 32, 1, 0, 490, 1, 0, 491, 1, 0, 492, 1, 1, 492, 1, 0, 493, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0
51030 data  32, 1, 0, 32, 1, 0, 32, 2, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 491, 1, 1, 491, 1, 1, 388, 0, 1, 491, 1, 1, 32, 1, 1, 32, 1, 0, 32, 1, 0, 32, 1, 1, 32, 1, 1, 388, 0, 1, 32, 1, 1, 32, 1, 1, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0
51040 data  32, 1, 0, 32, 1, 0, 32, 2, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 491, 1, 1, 491, 1, 1, 32, 1, 0, 491, 1, 1, 32, 1, 1, 344, 0, 11, 344, 0, 11, 32, 1, 1, 32, 1, 1, 32, 0, 0, 32, 1, 1, 32, 1, 1, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0
51050 data  32, 1, 0, 32, 1, 0, 32, 2, 0, 391, 11, 0, 392, 11, 0, 32, 0, 11, 491, 1, 1, 491, 1, 1, 404, 0, 1, 491, 1, 1, 32, 1, 1, 32, 0, 11, 32, 0, 11, 32, 1, 1, 32, 1, 1, 404, 0, 1, 32, 1, 1, 32, 1, 1, 32, 0, 11, 393, 11, 0, 394, 11, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0
51060 data  32, 1, 0, 32, 2, 0, 383, 11, 0, 286, 5, 11, 32, 0, 11, 32, 0, 11, 412, 1, 11, 32, 0, 1, 32, 0, 1, 32, 0, 1, 413, 1, 11, 32, 0, 11, 32, 0, 11, 412, 1, 11, 32, 1, 1, 32, 1, 1, 32, 1, 1, 413, 1, 11, 32, 0, 11, 32, 0, 11, 286, 5, 11, 382, 11, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0
51070 data  32, 2, 0, 384, 11, 0, 32, 0, 11, 286, 5, 11, 286, 5, 11, 32, 0, 11, 32, 0, 11, 32, 0, 11, 336, 1, 11, 32, 1, 11, 32, 0, 11, 32, 0, 11, 32, 0, 11, 32, 0, 11, 32, 0, 11, 336, 1, 11, 32, 0, 11, 32, 0, 11, 32, 0, 11, 286, 5, 11, 286, 5, 11, 32, 0, 11, 385, 11, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0
51080 data  32, 2, 0, 400, 11, 0, 32, 0, 11, 32, 0, 11, 32, 0, 11, 32, 0, 11, 32, 0, 11, 32, 0, 11, 32, 0, 11, 32, 0, 11, 32, 0, 11, 32, 0, 11, 32, 0, 11, 32, 0, 11, 32, 0, 11, 32, 0, 11, 32, 0, 11, 32, 0, 11, 32, 0, 11, 32, 0, 11, 32, 0, 11, 32, 0, 11, 401, 11, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0
51090 data  32, 2, 0, 516, 5, 11, 516, 5, 11, 516, 5, 11, 516, 5, 11, 516, 5, 11, 516, 5, 11, 516, 5, 11, 516, 5, 11, 516, 5, 11, 516, 5, 11, 516, 5, 11, 516, 5, 11, 516, 5, 11, 516, 5, 11, 516, 5, 11, 516, 5, 11, 516, 5, 11, 516, 5, 11, 516, 5, 11, 516, 5, 11, 516, 5, 11, 516, 5, 11, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0
51100 data  32, 1, 0, 383, 5, 5, 383, 5, 5, 383, 5, 5, 383, 5, 5, 383, 5, 5, 548, 0, 5, 312, 0, 5, 313, 0, 5, 549, 0, 5, 32, 0, 5, 32, 0, 5, 32, 0, 5, 548, 0, 5, 312, 0, 5, 313, 0, 5, 549, 0, 5, 32, 0, 5, 32, 5, 5, 32, 5, 5, 32, 5, 5, 32, 5, 5, 32, 5, 5, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0
51110 data  32, 1, 0, 382, 0, 5, 382, 5, 5, 382, 5, 5, 382, 5, 5, 382, 5, 5, 382, 5, 5, 382, 5, 5, 382, 5, 5, 382, 5, 5, 382, 5, 5, 382, 5, 5, 382, 5, 5, 382, 5, 5, 382, 5, 5, 382, 5, 5, 382, 5, 5, 382, 5, 5, 382, 5, 5, 382, 5, 5, 382, 5, 5, 382, 5, 5, 383, 0, 5, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0
51120 data  32, 2, 0, 32, 11, 0, 32, 5, 0, 382, 0, 5, 32, 0, 5, 32, 0, 5, 32, 0, 5, 32, 0, 5, 32, 0, 5, 32, 0, 5, 32, 0, 5, 32, 0, 5, 32, 0, 5, 32, 0, 5, 32, 0, 5, 32, 0, 5, 32, 0, 5, 32, 0, 5, 32, 0, 5, 32, 0, 5, 383, 0, 5, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0
51130 data  32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 386, 8, 0, 387, 8, 0, 32, 18, 0, 32, 18, 0, 32, 18, 0, 32, 18, 0, 32, 18, 0, 32, 18, 0, 32, 18, 0, 386, 8, 0, 387, 8, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0
51140 data  32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 402, 1, 0, 403, 1, 0, 369, 27, 0, 515, 0, 27, 515, 0, 27, 515, 0, 27, 515, 0, 27, 515, 0, 27, 515, 0, 27, 402, 1, 0, 403, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 5, 0, 32, 1, 0, 32, 1, 0, 32, 5, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 383, 27, 0, 32, 1, 0
51150 data  32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 447, 21, 0, 286, 5, 21, 286, 5, 21, 32, 0, 21, 32, 0, 21, 32, 0, 21, 414, 0, 21, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 552, 11, 27, 32, 1, 0
51160 data  32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 286, 5, 21, 286, 5, 21, 286, 5, 21, 32, 0, 21, 32, 0, 21, 414, 0, 21, 32, 27, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 383, 27, 0, 32, 0, 27, 32, 1, 0
51170 data  32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 383, 27, 0, 286, 11, 27, 286, 11, 27, 32, 5, 27, 32, 0, 27, 32, 0, 27, 32, 27, 0, 32, 27, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 383, 21, 0, 286, 5, 21, 384, 0, 21, 32, 21, 0
51180 data  32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 286, 11, 27, 286, 11, 27, 32, 0, 27, 32, 5, 27, 32, 0, 27, 32, 0, 27, 32, 27, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 286, 11, 27, 32, 0, 27, 400, 0, 27, 32, 1, 0
51190 data  32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 382, 0, 27, 552, 11, 27, 32, 0, 27, 32, 5, 27, 32, 0, 27, 32, 0, 27, 382, 27, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 383, 27, 0, 286, 11, 27, 32, 0, 27, 32, 1, 0, 32, 1, 0
51200 data  32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 27, 0, 382, 0, 21, 286, 5, 21, 286, 5, 21, 286, 5, 21, 552, 5, 21, 286, 21, 21, 382, 21, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 27, 0, 383, 21, 0, 286, 5, 21, 32, 0, 21, 384, 0, 21, 32, 1, 0, 32, 1, 0
51210 data  32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 27, 0, 286, 5, 21, 286, 5, 21, 552, 5, 21, 552, 5, 21, 32, 5, 21, 32, 0, 21, 32, 21, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 391, 27, 0, 392, 27, 0, 286, 11, 27, 286, 5, 21, 286, 5, 21, 286, 5, 21, 286, 11, 27, 32, 0, 27, 286, 11, 27, 393, 27, 0, 394, 21, 0, 32, 21, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 18, 0, 383, 27, 0, 286, 11, 27, 32, 0, 27, 552, 28, 27, 400, 0, 27, 32, 1, 0, 32, 1, 0
51220 data  32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 27, 0, 382, 0, 27, 286, 11, 27, 32, 0, 27, 32, 0, 27, 286, 11, 27, 286, 11, 27, 382, 27, 0, 32, 1, 0, 391, 21, 0, 392, 21, 0, 286, 5, 21, 286, 11, 27, 32, 0, 27, 286, 11, 27, 32, 0, 27, 32, 0, 21, 552, 5, 21, 286, 5, 21, 32, 0, 27, 32, 0, 27, 32, 0, 27, 286, 11, 27, 286, 5, 21, 286, 5, 21, 286, 11, 27, 393, 27, 0, 394, 27, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 21, 0, 383, 27, 0, 286, 11, 27, 32, 0, 27, 553, 28, 27, 392, 0, 27, 32, 1, 0, 32, 1, 0, 32, 1, 0
51230 data  32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 286, 11, 27, 32, 5, 27, 32, 5, 27, 32, 0, 27, 286, 11, 27, 286, 11, 27, 286, 5, 21, 286, 5, 21, 286, 5, 21, 552, 5, 21, 32, 5, 27, 32, 5, 27, 32, 0, 27, 32, 0, 27, 32, 0, 21, 32, 5, 21, 32, 5, 21, 32, 28, 27, 32, 28, 27, 32, 28, 27, 32, 28, 27, 32, 28, 21, 32, 28, 21, 32, 28, 27, 552, 11, 27, 32, 28, 27, 32, 28, 27, 32, 28, 27, 32, 28, 21, 552, 5, 21, 32, 28, 27, 286, 28, 27, 286, 28, 27, 383, 0, 27, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0
51240 data  32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 382, 0, 27, 286, 11, 27, 32, 0, 27, 32, 0, 27, 32, 0, 27, 32, 0, 27, 32, 5, 21, 32, 0, 21, 32, 0, 21, 32, 0, 21, 32, 0, 27, 32, 0, 27, 32, 0, 27, 286, 28, 27, 32, 0, 21, 552, 19, 21, 32, 5, 21, 286, 28, 27, 553, 28, 27, 286, 28, 27, 32, 0, 27, 32, 0, 21, 32, 0, 21, 32, 0, 27, 32, 28, 27, 32, 0, 27, 32, 0, 27, 32, 0, 27, 286, 5, 21, 32, 0, 21, 286, 28, 27, 286, 28, 27, 286, 28, 27, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0
51250 data  32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 415, 0, 27, 286, 28, 27, 286, 28, 27, 553, 28, 27, 32, 0, 27, 552, 19, 21, 286, 19, 21, 552, 19, 21, 552, 19, 21, 552, 28, 27, 286, 28, 27, 553, 28, 27, 391, 0, 27, 392, 0, 21, 32, 1, 0, 32, 1, 0, 32, 1, 0, 393, 0, 27, 394, 0, 27, 286, 28, 27, 552, 19, 21, 286, 19, 21, 286, 28, 27, 552, 28, 27, 286, 28, 27, 553, 28, 27, 286, 28, 27, 552, 19, 21, 286, 19, 21, 286, 28, 27, 391, 0, 27, 392, 0, 27, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0
51260 data  32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 393, 0, 27, 354, 0, 27, 346, 27, 0, 347, 27, 0, 346, 21, 0, 345, 21, 0, 344, 21, 0, 340, 21, 0, 339, 27, 0, 337, 27, 0, 32, 18, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 27, 0, 337, 21, 0, 338, 21, 0, 339, 27, 0, 339, 27, 0, 340, 27, 0, 339, 27, 0, 339, 27, 0, 338, 21, 0, 337, 21, 0, 336, 27, 0, 32, 27, 0, 32, 27, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0
52010 data 22, 14
52020 data 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 490, 1, 0, 491, 1, 0, 492, 1, 1, 492, 1, 0, 493, 1, 0, 32, 1, 0, 32, 1, 0, 32, 4, 0, 32, 4, 0, 32, 4, 0, 32, 4, 0, 32, 4, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0
52030 data 32, 1, 0, 32, 2, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 491, 1, 1, 491, 1, 1, 32, 0, 1, 491, 1, 1, 32, 1, 1, 32, 1, 0, 32, 1, 0, 490, 1, 0, 491, 1, 0, 32, 0, 1, 492, 1, 0, 493, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0
52040 data 32, 1, 0, 32, 2, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 491, 1, 1, 491, 1, 1, 436, 0, 1, 491, 1, 1, 32, 1, 1, 344, 0, 31, 344, 0, 31, 32, 1, 1, 32, 1, 1, 436, 0, 1, 32, 1, 1, 32, 1, 1, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0
52050 data 32, 1, 0, 32, 2, 0, 391, 31, 0, 392, 31, 0, 32, 6, 31, 491, 1, 1, 491, 1, 1, 420, 0, 1, 491, 1, 1, 32, 1, 1, 32, 6, 31, 32, 6, 31, 32, 1, 1, 32, 1, 1, 420, 0, 1, 32, 1, 1, 32, 1, 1, 32, 6, 31, 393, 31, 0, 394, 31, 0, 32, 1, 0, 32, 1, 0
52060 data 32, 2, 0, 383, 31, 0, 286, 6, 31, 32, 6, 31, 32, 6, 31, 412, 1, 31, 32, 0, 1, 32, 0, 1, 32, 0, 1, 413, 1, 31, 32, 6, 31, 32, 6, 31, 412, 1, 31, 32, 1, 1, 32, 1, 1, 32, 1, 1, 413, 1, 31, 32, 6, 31, 32, 6, 31, 286, 6, 31, 382, 31, 0, 32, 1, 0
52070 data 384, 31, 0, 32, 6, 31, 286, 6, 31, 286, 6, 31, 32, 6, 31, 32, 6, 31, 32, 6, 31, 336, 1, 31, 32, 6, 31, 32, 6, 31, 32, 6, 31, 32, 6, 31, 32, 6, 31, 32, 6, 31, 336, 1, 31, 32, 6, 31, 32, 6, 31, 32, 6, 31, 286, 6, 31, 286, 6, 31, 32, 6, 31, 385, 31, 0
52080 data 400, 31, 0, 32, 0, 31, 32, 6, 31, 32, 6, 31, 32, 6, 31, 32, 6, 31, 32, 6, 31, 32, 6, 31, 32, 6, 31, 32, 6, 31, 32, 6, 31, 32, 6, 31, 32, 6, 31, 32, 6, 31, 32, 6, 31, 32, 6, 31, 32, 6, 31, 32, 6, 31, 32, 6, 31, 32, 6, 31, 32, 6, 31, 401, 31, 0
52090 data 516, 31, 6, 516, 31, 6, 516, 31, 6, 516, 31, 6, 516, 31, 6, 516, 31, 6, 516, 31, 6, 516, 31, 6, 516, 31, 6, 516, 31, 6, 516, 31, 6, 516, 31, 6, 516, 31, 6, 516, 31, 6, 516, 31, 6, 516, 31, 6, 516, 31, 6, 516, 31, 6, 516, 31, 6, 516, 31, 6, 516, 31, 6, 516, 31, 6
52100 data 32, 31, 6, 32, 31, 6, 32, 31, 6, 32, 31, 6, 32, 31, 6, 548, 31, 6, 312, 0, 6, 313, 0, 6, 549, 31, 6, 32, 31, 6, 32, 31, 6, 32, 31, 6, 548, 31, 6, 312, 0, 6, 313, 0, 6, 549, 31, 6, 32, 31, 6, 32, 31, 6, 32, 31, 6, 32, 31, 6, 32, 31, 6, 32, 31, 6
52110 data 382, 0, 6, 32, 31, 6, 32, 31, 6, 32, 31, 6, 32, 31, 6, 32, 31, 6, 32, 31, 6, 32, 31, 6, 32, 31, 6, 32, 31, 6, 32, 31, 6, 32, 31, 6, 32, 31, 6, 32, 31, 6, 32, 31, 6, 32, 31, 6, 32, 31, 6, 32, 31, 6, 32, 31, 6, 32, 31, 6, 32, 31, 6, 383, 0, 6
52120 data  32, 11, 0, 32, 5, 0, 382, 0, 6, 32, 31, 6, 32, 31, 6, 32, 31, 6, 32, 31, 6, 32, 31, 6, 32, 31, 6, 32, 31, 6, 32, 31, 6, 32, 31, 6, 32, 31, 6, 32, 31, 6, 32, 31, 6, 32, 31, 6, 32, 31, 6, 32, 31, 6, 32, 31, 6, 383, 0, 6, 32, 1, 0, 32, 1, 0
52130 data  32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 386, 31, 0, 387, 31, 0, 32, 31, 0, 32, 15, 0, 32, 18, 0, 32, 18, 0, 32, 18, 0, 32, 18, 0, 32, 18, 0, 386, 31, 0, 387, 31, 0, 32, 31, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0
52140 data  32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 402, 15, 0, 403, 15, 0, 369, 31, 0, 515, 0, 31, 515, 0, 31, 515, 0, 31, 515, 0, 31, 515, 0, 31, 515, 0, 31, 281, 15, 0, 283, 15, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0
52150 data  32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 31, 0, 514, 31, 0, 514, 31, 0, 514, 31, 0, 514, 31, 0, 514, 31, 0, 514, 31, 0, 32, 12, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0, 32, 1, 0
53010 data 15, 12
53020 data  32, 1, 20, 32, 1, 20, 32, 1, 20, 32, 1, 20, 32, 1, 20, 32, 1, 20, 32, 1, 20, 32, 1, 20, 499, 1, 20, 32, 1, 20, 32, 1, 20, 32, 1, 20, 32, 1, 20, 32, 1, 20, 32, 1, 20
53030 data  32, 1, 20, 362, 1, 20, 32, 1, 20, 32, 1, 20, 32, 1, 20, 580, 1, 20, 32, 1, 20, 32, 1, 20, 32, 1, 20, 32, 1, 20, 578, 1, 20, 32, 1, 20, 411, 20, 5, 411, 5, 20, 499, 1, 20
53040 data  32, 1, 20, 32, 1, 20, 32, 1, 20, 32, 1, 20, 32, 1, 20, 32, 1, 20, 32, 1, 20, 499, 1, 20, 32, 1, 20, 32, 1, 20, 32, 1, 20, 32, 1, 20, 413, 20, 5, 413, 5, 20, 32, 1, 20
53050 data  32, 1, 20, 32, 1, 20, 32, 1, 20, 32, 1, 20, 363, 1, 20, 32, 1, 20, 32, 1, 20, 32, 1, 20, 32, 1, 20, 32, 1, 20, 32, 1, 20, 32, 1, 20, 32, 1, 20, 32, 1, 20, 32, 1, 20
53060 data  32, 1, 20, 578, 1, 20, 32, 1, 20, 32, 1, 20, 32, 1, 20, 32, 1, 20, 515, 8, 9, 515, 8, 9, 515, 8, 9, 32, 1, 20, 499, 1, 20, 32, 1, 20, 363, 1, 20, 32, 1, 20, 578, 1, 20
53070 data  32, 1, 20, 32, 1, 20, 32, 1, 20, 347, 20, 9, 347, 20, 9, 347, 20, 9, 32, 1, 9, 32, 1, 9, 32, 1, 9, 347, 20, 9, 347, 20, 9, 347, 20, 9, 32, 1, 20, 32, 1, 20, 32, 1, 20
53080 data  383, 0, 20, 382, 0, 20, 32, 1, 20, 32, 1, 9, 32, 1, 9, 32, 1, 9, 82, 0, 9, 73, 0, 9, 80, 0, 9, 32, 1, 9, 32, 1, 9, 32, 1, 9, 499, 1, 20, 32, 1, 20, 32, 1, 20
53090 data  32, 3, 0, 32, 3, 0, 372, 0, 20, 347, 9, 20, 347, 9, 20, 347, 9, 20, 32, 1, 9, 32, 1, 9, 32, 1, 9, 347, 9, 20, 347, 9, 20, 347, 9, 20, 32, 1, 20, 372, 0, 20, 372, 0, 20
53100 data  32, 3, 0, 32, 3, 0, 32, 3, 0, 32, 3, 0, 32, 3, 0, 32, 3, 0, 512, 26, 9, 512, 26, 9, 512, 26, 9, 32, 3, 0, 32, 3, 0, 32, 3, 0, 32, 3, 0, 32, 3, 0, 32, 3, 0
53110 data  32, 3, 0, 32, 3, 0, 32, 3, 0, 32, 3, 0, 32, 3, 0, 32, 3, 0, 514, 9, 26, 514, 9, 26, 514, 9, 26, 32, 3, 0, 32, 3, 0, 32, 3, 0, 32, 3, 0, 32, 3, 0, 32, 3, 0
53120 data  475, 3, 0, 475, 3, 0, 475, 3, 0, 475, 3, 0, 475, 3, 0, 475, 3, 0, 515, 9, 26, 515, 9, 26, 515, 9, 26, 475, 3, 0, 475, 3, 0, 475, 3, 0, 475, 3, 0, 475, 3, 0, 475, 3, 0
53130 data  32, 9, 3, 32, 9, 3, 32, 9, 3, 32, 9, 3, 32, 9, 3, 383, 0, 3, 32, 3, 0, 32, 3, 0, 32, 3, 0, 382, 0, 3, 32, 9, 3, 32, 9, 3, 32, 9, 3, 32, 9, 3, 32, 9, 3
54010 data  19, 9
54020 data   32, 12, 25, 32, 12, 25, 32, 12, 25, 513, 26, 25, 512, 26, 25, 512, 26, 25, 512, 26, 25, 512, 25, 26, 512, 25, 26, 512, 25, 26, 512, 25, 26, 512, 25, 26, 512, 25, 26, 512, 25, 26, 512, 25, 26, 512, 25, 26, 513, 26, 25, 32, 12, 25, 32, 12, 25
54030 data   32, 12, 25, 32, 12, 25, 32, 12, 25, 329, 0, 12, 393, 27, 25, 394, 27, 26, 514, 25, 26, 514, 26, 25, 514, 0, 26, 514, 26, 0, 514, 26, 0, 514, 26, 0, 514, 0, 26, 514, 25, 26, 514, 25, 26, 514, 25, 26, 512, 25, 26, 513, 26, 25, 32, 12, 25
54040 data   32, 12, 25, 32, 12, 25, 32, 12, 25, 329, 0, 12, 519, 12, 27, 535, 27, 12, 393, 12, 0, 394, 28, 0, 572, 5, 0, 362, 5, 0, 572, 5, 0, 363, 5, 0, 362, 5, 0, 32, 1, 0, 513, 26, 0, 514, 25, 26, 515, 25, 26, 512, 25, 26, 513, 26, 25
54050 data   32, 12, 25, 32, 12, 25, 32, 12, 25, 329, 0, 12, 535, 27, 12, 535, 27, 12, 519, 28, 12, 572, 5, 28, 513, 5, 1, 513, 5, 1, 513, 5, 1, 513, 5, 1, 572, 5, 0, 32, 1, 0, 513, 26, 0, 514, 25, 26, 515, 25, 26, 512, 25, 26, 513, 26, 25
54060 data   32, 12, 25, 32, 12, 25, 32, 12, 25, 329, 0, 12, 535, 27, 12, 535, 27, 12, 519, 28, 12, 361, 5, 28, 513, 5, 1, 32, 0, 1, 32, 0, 1, 513, 5, 1, 362, 5, 0, 363, 5, 0, 513, 26, 0, 514, 25, 26, 515, 25, 26, 512, 25, 26, 513, 26, 25
54070 data   32, 12, 25, 32, 12, 25, 32, 12, 25, 329, 0, 12, 519, 27, 12, 535, 27, 12, 519, 28, 12, 363, 5, 28, 513, 5, 1, 32, 0, 1, 32, 0, 1, 513, 5, 1, 572, 5, 0, 499, 5, 0, 513, 26, 0, 514, 25, 26, 515, 25, 26, 512, 25, 26, 513, 26, 25
54080 data   32, 12, 25, 32, 12, 25, 32, 12, 25, 329, 0, 12, 535, 27, 12, 535, 27, 12, 519, 28, 12, 572, 5, 28, 513, 5, 1, 32, 5, 1, 32, 5, 1, 513, 5, 1, 572, 5, 0, 363, 5, 0, 513, 26, 0, 514, 25, 26, 515, 25, 26, 512, 25, 26, 513, 26, 25
54090 data   32, 12, 20, 32, 12, 20, 32, 12, 20, 329, 0, 12, 519, 12, 27, 535, 27, 12, 391, 20, 12, 392, 20, 28, 383, 4, 20, 32, 20, 4, 32, 20, 4, 382, 4, 20, 32, 4, 20, 32, 28, 20, 32, 28, 20, 32, 28, 20, 32, 12, 20, 32, 12, 20, 32, 12, 20
54100 data   32, 12, 20, 32, 12, 20, 32, 12, 20, 329, 0, 12, 391, 20, 27, 392, 20, 27, 32, 4, 20, 383, 4, 20, 514, 20, 4, 32, 20, 4, 514, 20, 4, 32, 20, 4, 382, 4, 20, 32, 4, 20, 32, 4, 20, 32, 4, 20, 32, 4, 20, 32, 4, 20, 32, 4, 20

