10 ORIGIN WIDTH ()/ 2,HEIGHT ()/ 2, 1,- 1
15 color 1,0,4: gcolor 9: cls
16 line -350,0,350,0
17 line 0,-200,0,200
18 gcolor 1
20 FOR T =-PI TO PI STEP .01
30 X =T *100
40 Y =INT ((SIN (T )*200))
50 PLOT X ,Y
60 NEXT
