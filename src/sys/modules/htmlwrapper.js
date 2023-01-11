class KERNALMODULE {

  constructor( sys ) {
    if(!sys) {
      throw "sys expected";
    }
    this.sys = sys;
    this.node  = document.body;
    document.body.id = "top";
    this.isAttr = false;
  }

  init() {
  }

  executeFunction( paramArray ) {
    if( paramArray[0] == "body.style.backgroundImage") {
      document.body.style.backgroundImage = "url('" +paramArray[1]+ "')";
      document.body.style.backgroundSize = "cover";
    }
  }

  execute( htmlCodeArr ) {
    var htmlCode = htmlCodeArr[0];
    console.log( "execute",  htmlCode );

    var handle = htmlCode.htmlHandle;
    if( handle ) {
      this.setnode( handle );
    }
    else {
      this.isAttr = false;
    }

    if( this.node == null ) {
        console.log("invalid html root");
        return; //TODO back propagate error
    }

    if( this.isAttr == false ) {
      /* element */

      if( htmlCode.htmlAppend) {
        var s = document.createElement("span");
        s.innerHTML = htmlCode.htmlValue;

        const list = s.childNodes;
        var arr = [];
        for (let i = 0; i < list.length; i++) {
            arr.push( list[i] );
        }

        for (let i = 0; i < arr.length; i++) {
            this.node.appendChild( arr[i]  );
        }

        s = null;

      }
      else {
        if( this.node.id == "top" ) {
          console.log("Cannot replace body code. it would crash the console!")
          return;
        }

        this.node.innerHTML = htmlCode.htmlValue;
      }
    }
    else {
      /* attribute */

      var attr = this.node.attributes.getNamedItem( this.attrName );
      if( attr == null ) {
        console.log("Attr '"+this.attrName+"' not found on html node "+this.node.id+"!")
        return;
      }
      attr = attr.nodeValue;

      if( htmlCode.htmlAppend) {
        attr = attr + htmlCode.htmlValue;
      }
      else {
        attr = htmlCode.htmlValue;
      }

      this.node.setAttribute( this.attrName, attr );
    }

  }


  setnode( handle ) {

    console.log( "setnode",  handle );
    this.isAttr = false;

    if( handle == ".." ) {
      this.node  = this.node.parentNode;
    }
    else {
      var parts = handle.split(".");
      var attrName = null;
      var elName = null;

      if( parts.length > 1) {
        elName = parts[0];
        attrName = parts[1];
      }
      else {
        elName = handle;
      }

      if( elName != "" ) {
        var el = document.getElementById(  elName  );
        if( el ) {
          this.node = el;
        }
        else {
          console.log("could not find", handle);
          return;
        }
      }

      if( attrName != "" && attrName != null ) {
        this.isAttr = true;
        this.attrName = attrName;
    }

  }

}
/*


-- flavour 1

OPEN "html://" FOR OUTPUT AS #1
PRINT #1, "<b>hello world </b>"
CLOSE #1

-- flavour 2

HTM <b id="mylabel">hello world</b>
HTMINNER "mylabel", "hello 2"
HTMCLEAR "mybody"

HTM "b", "mylabel" TO el
HTMTEXT "hello world"

-- flavour 2b

; stay on same line
+ stay in element


HTM "b" TO el
HTMTEXT el, "hello world"


HTM "b"+
HTMTEXT "hello world"+
HTM "br"
HTMTEXT "hello world2 "



-- flavour 3

HTAG "b";
HTEXT "hello world";
HCLOSE;

-- flavour 4

b = html("b")
html b, "hello word"
sleep
html b, "hello my world"

table = html("table")

--- flavour 5

  #add tag

  b=htag("b")

  or htag "b" to b

  or htag "b" : REM implicit output variable hnode
     b = hnode

  hclr b
  hprint b, "hello world1"
  hprint b, "hello world2"


  htag "div"
  hstyle hnode add "bg-color=red"
  hstyle hnode add "font-size=10px"
  hprint div, "hello world1"

  htag "div" in div
  hstyle hnode add "bg-color=blue"
  hprint div, "hello world1"

  console ""


  ---

  h "" to "<body>"
  h "<div id=1000>Hello world</div>"
  h "" to 1000
  hattr "1000.style" set     "background-color=green"
  hattr "1000.style" append  ";color=red"

  hshow "1000", 0
  sleep 1
  hshow "1000", 0

  htext "1234";


----------------

content usecases
c1a append         >""
c1b append text
c1c append text with newline
c2 clear          CLR
c3 overwrite      ""
c4 get

attr usecases
a1 set attribute
a2 append attribute
a3 get

target usecases
t1 current target      <nothing>
t2 explicit target     <target>,"<html>"
t3 jump to new target hpos hjmp, hgoto htmlj command


*t1
implicit :  html "<b>implicitly in current parent</b>"

*t2
explicit :
    html 1000, "<b>explicitly in specified parent</b>"
    or
    html "<b>explicitly in specified parent</b>" to 1000

*t3
explicit :  html to 1000



  usecases
  1a set body
  1b clear body
  2 append element in body
  3 clear Element
  4 append element in body
  5 add text to element
  6 add text to element on same line
  7 add text to element on next line
  8 set attr to element
  9 append into element attr



  target-and-append-usecases
  ta1 append to current target
  ta2 overwrite current target


  uc 1a
  h "<center>hello world</center>" to "<body>"

  uc 2
  h "<div>Hello world</div>"

  uc 3
  h "<div id=1000>Hello world</div>"
  h "" to 1000

  uc 4
  h "<div id=1000>Hello world</div>"
  h "<b>Hello bold world</b>" to 1000

  uc 5
  h "<div id=1000>Hello world</div>"
  htxt "Hello bold world"

  uc 6
  h "<div id=1000>Hello world</div>"
  htxt "Hello bold world";
  htxt "Hello bold world2"

  uc 7
  h "<div id=1000>Hello world</div>"
  htxt "Hello bold world"
  htxt "Hello bold world2"



*/


}

export { KERNALMODULE as default};
