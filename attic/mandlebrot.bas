0 cls reset
5 dim cc(5): cc(0)=4: cc(1) = 15: cc(2)= 6: cc(3)= 14: cc(4)= 1
100 rem mandelbrot set in b & w
110 w=640: h=480 : wm1 = w-1 : hd2 = h/2 : ls = 5
115 gcolor 1: cls
120 for lx = 1 to 10 : for ly = 1 to 10
125 for x = lx to wm1 step ls :for y = ly to hd2 step ls
130 x1 = x / w * 3 - 2:y1 = y / h * 2 - 1
140 i = 0:s = x1:t = y1:c = 0
150 s1 = s * s - t * t + x1
160 t = 2 * s * t + y1:s = s1:c = 1 - c:i = i + 1
165 st2 = s * s + t * t : sti2 = st2:
166 if sti2 > 4 then sti2 = sti2 - 4: goto 166
170 if  st2 < 4 and i < 117 then goto 150
180 if( c > 0 ) then ci = cc( int( sti2 ) ) : gcolor ci : plot x,y:plot x,h - y
190 next: next: next: next
