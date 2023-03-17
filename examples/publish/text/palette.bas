0 cls reset : color 1,0: cls
10 for t=0 to 15
20 color 0,t : if t = 0 then color 1,0
25 locate t,0 : print " " ; t ; " ";
30 color 0,t+16 : if t = 0 then color 1,0
35 locate t,10 : print " " ; (t+16) ; " ";
50 next
60 color 1,0
65 print
