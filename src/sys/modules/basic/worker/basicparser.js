class Parser {

  constructor( cmds, ecmds ) {
    this.commands = cmds;
    this.extendedcommands = ecmds;
    this.erh = new ErrorHandler();
    this.debugFlag = false;
  }

  init() {

	  this.CTRL_KW = ["IF","THEN","GOTO","AND", "NOT", "OR",  "GOSUB", "RETURN", "FOR", "TO", "NEXT", "STEP", "DATA", "REM", "GOSUB", "DIM", "END", "LET", "STOP", "DEF", "FN", "ON", "SUB", "INTERRUPT0", "INTERRUPT1" ];
    this.SHORTCUT_KW = ["?"];

    this.KEYWORDS = this.commands.getStatements();

    var more = this.extendedcommands.getStatements();
    for( var i=0; i<more.length; i++) {
      this.KEYWORDS.push( more[ i ] );
    }

    more = this.commands.getFunctions();
    for( var i=0; i<more.length; i++) {
      this.KEYWORDS.push( more[ i ] );
    }

    more = this.extendedcommands.getFunctions();
    for( var i=0; i<more.length; i++) {
      this.KEYWORDS.push( more[ i ] );
    }

     for( var i=0; i<this.CTRL_KW.length; i++) {
       this.KEYWORDS.push( this.CTRL_KW[ i ] );
     }

     for( var i=0; i<this.SHORTCUT_KW.length; i++) {
       this.KEYWORDS.push( this.SHORTCUT_KW[ i ] );
     }
     //this.padArray( this.KWCODES, 256 );

     if( this.debugFlag ) { console.log("KEYWORDS:" , this.KEYWORDS ); }

     this.screenCodes2CTRLTable = [];
     var tab = this.screenCodes2CTRLTable;

     tab['\x93'] = '\x13';
     tab['\xd3'] = '\x93';
  }

  getKeyWordCodes() {

    this.throwError( null, "(Extended) Keywords not yet supported", "extended disabled" );
    return this.KWCODES;
  }

  padArray( arr, nr ) {
    var missing = nr - arr.length;
    while( missing > 0) {
      arr.push( null );
      missing--;
    }
  }

  throwError( ctx, detail, clazz ) {

    var clazz2 = clazz;
    if( clazz2 === undefined ) {
      clazz2 = "syntax";
    }

    if( ctx ) {
      console.log(" Exception " + clazz + " at line " + ctx.lineNumber+ " " + detail );
    }

    if( ctx ) {
      if( ! ( ctx.lineNumber == undefined ) ) {
        this.erh.throwError( clazz2, detail, ctx, ctx.lineNumber );
      }
    }

    this.erh.throwError( clazz2, detail, undefined, -1 );

  }

  upperCaseNameTokens( tokens ) {

		for( 	var i=0;
					i<tokens.length;
					i++)
		{
			var token = tokens[i];

			if( token ) {
				if( token.type == "name" ) {
					token.data = token.data.toUpperCase();
				}
			}

		}

		return tokens;
	}

	removePadding( tokens ) {
		var tokens2 = [];

		for( 	var i=0;
					i<tokens.length;
					i++)
		{
			var token = tokens[i];

			if( token ) {
				if( token.type != "pad" ) {
					tokens2.push( token );
				}
			}

		}

		return tokens2;
	}

  mergeCompTokens( tokens ) {
		var tokens2 = [];

    /* Convert token sequences like ("<","=")
       into single token "<=" */

		for( 	var i=0;
					i<tokens.length;
					i++)
		{
			var token = tokens[i];

			if( i>0 ) {
        var token2 = tokens[i-1];
				if( ( token.type == "comp" || token.type == "eq" ) &&
            ( token2.type == "comp" || token2.type == "eq" ) ) {
					token2.type = "@@removeme";
          token.data = token2.data + token.data;
          token.type = "comp";
          if( token.data == "><" ) {
            token.data = "<>";
          }
          else if( token.data == "=<" ) {
            token.data = "<=";
          }
          else if( token.data == "=>" ) {
            token.data = ">=";
          }

  			}
			}

      if( ( token.type == "name"  && token.data == "OR" ) ||
        ( token.type == "name"  && token.data == "AND" ) ||
        ( token.type == "name"  && token.data == "NOT" )) {
          token.type = "bop";
        }

		}

    for( 	var i=0;
					i<tokens.length;
					i++)
		{
      if( tokens[i].type!="@@removeme") {
        tokens2.push( tokens[i] );
      }
    }

		return tokens2;
	}



  mergeBrokenUpTokens( tokens ) {

    var splits = [];

    //console.log("tokens",tokens)
    //standard
    splits.push( { p1: "REST", p2: "OR", p3: "E", whole: "RESTORE" } );
    splits.push( { p1: "S", p2: "TO", p3: "P", whole: "STOP" } );


    //extended
//    splits.push( { p1: "Dsk", p2: "OR", p3: "T", whole: "DXPORT" } );
//    splits.push( { p1: "LXP", p2: "OR", p3: "T", whole: "LXPORT" } );
    splits.push( { p1: "IMP", p2: "OR", p3: "T", whole: "IMPORT" } );
    splits.push( { p1: "EXP", p2: "OR", p3: "T", whole: "EXPORT" } );
    splits.push( { p1: "L", p2: "GET", p3: "URL", whole: "LGETURL" } );
    splits.push( { p1: "L", p2: "GET", p3: "NAME", whole: "LGETNAME" } );
    splits.push( { p1: "L", p2: "GET", p3: "ID", whole: "LGETID" } );
    splits.push( { p1: "GO", p2: "TO", p3: null, whole: "GOTO" } );
    splits.push( { p1: "GO", p2: "SUB", p3: null, whole: "GOSUB" } );

    splits.push( { p1: "GO", p2: "LINK", p3: null, whole: "GOLINK" } );
    splits.push( { p1: "WINDOW", p2: "S", p3: null, whole: "WINDOWS" } );
    splits.push( { p1: "UN", p2: "TAG", p3: null, whole: "UNTAG" } );
    splits.push( { p1: "LINK", p2: "S", p3: null, whole: "LINKS" } );
    splits.push( { p1: "DE", p2: "LET", p3: "E", whole: "DELETE" } );
    splits.push( { p1: "LDE", p2: "LET", p3: "E", whole: "LDELETE" } );
    splits.push( { p1: "TDE", p2: "LET", p3: "E", whole: "TDELETE" } );
    splits.push( { p1: "B", p2: "OR", p3: "DER", whole: "BORDER" } );
    splits.push( { p1: "G", p2: "COLOR", p3: "S", whole: "GCOLORS" } );
    splits.push( { p1: "CHAR", p2: "COL", p3: null, whole: "CHARCOL" } );
    splits.push( { p1: "SFRAME", p2: "CP", p3: null, whole: "SFRAMECP" } );
    splits.push( { p1: "SFRAME", p2: "FLIPX", p3: null, whole: "SFRAMEFLIPX" } );
    splits.push( { p1: "SFRAME", p2: "FLIPY", p3: null, whole: "SFRAMEFLIPY" } );
    splits.push( { p1: "SFRAME", p2: "FX", p3: null, whole: "SFRAMEFX" } );
    splits.push( { p1: "TAG", p2: "S", p3: null, whole: "TAGS" } );
    splits.push( { p1: "X", p2: "ON", p3: null, whole: "XON" } );
    splits.push( { p1: "S", p2: "POS", p3: null, whole: "SPOS" } );
    splits.push( { p1: "S", p2: "POKE", p3: null, whole: "SPOKE" } );
    splits.push( { p1: "WJ", p2: "IF", p3: "FY", whole: "WJIFFY" } );
    splits.push( { p1: "REF", p2: "OR", p3: "MAT", whole: "REFORMAT" } );


    var tokens2 = []; //tokens;

    for( var i=0; i<tokens.length; i++) {
      tokens2.push( tokens[ i ]);
    }

    for( var i=0; i<splits.length; i++) {
      var r=splits[i];
      tokens2 = this.mergeTokenRange( tokens2, r );
    }

    if( this.debugFlag ) {  console.log( tokens2 ); }
    return tokens2;
  }


  mergeTokenRange( tokens, record ) {
		var tokens2 = [];
    var tokens3 = [];

    /* Convert "S","TO","P" into "STOP" */

		for( 	var i=0;
					i<tokens.length;
					i++)
		{
      tokens2[i] = tokens[i];
		}

    for( 	var i=1;
					i<tokens2.length;
					i++)
		{
      if( record.p3 == null ) {
        if(
           ( tokens2[i-1].type == "name" || tokens2[i-1].type == "bop" ) &&
           ( tokens2[i-0].type == "name" || tokens2[i-0].type == "bop" ) ) {
             if(
                tokens2[i-1].data == record.p1 &&
                tokens2[i-0].data == record.p2 ) {
                  tokens2[i-1].data = record.whole;
                  tokens2[i-0].type = "removeme";
                }
           }
      }
      else {
        if(i<2) {
          continue;
        }
        if(
          ( tokens2[i-2].type == "name" || tokens2[i-2].type == "bop" ) &&
           ( tokens2[i-1].type == "name" || tokens2[i-1].type == "bop" ) &&
           ( tokens2[i-0].type == "name" || tokens2[i-0].type == "bop" ) ) {

             if( tokens2[i-2].data == record.p1 &&
                tokens2[i-1].data == record.p2 &&
                tokens2[i-0].data == record.p3 ) {
                  tokens2[i-2].data = record.whole;
                  tokens2[i-1].type = "removeme";
                  tokens2[i-0].type = "removeme";
                }
           }
      }
		}

    var j=0;
    for( 	var i=0;
					i<tokens2.length;
					i++)
		{
      if( tokens2[i].type != "removeme" ) {
          tokens3[j] = tokens2[i];
          j++;
      }
		}

		return tokens3;
	}

	parseFunParList( context ) {

		var tokens = context.tokens;
		var params = [];
		var even = true;

		var endTokens = [];
		endTokens.push( { type: "sep", data: "@@@all" });
		endTokens.push( { type: "bracket", data: ")" });

		endTokens.push();

		while( true ) {

			var token;

      if( tokens.length > 0) {
        if( tokens[0].type=="bracket" && tokens[0].data==")") {
          break;
        }
      }

			if( even ) {
        var expr = this.parseBoolExpression( context, endTokens );
        expr.type = "expr";
				params.push( expr );
			}
			else {
				token = tokens.shift();

				if( token.type=="sep" ) {
					//all ok, next par
				}
				else {
					this.throwError( context, "Expected ',' or ')', got '" + token.data + "'");
				}
			}
			even = !even;
		}

		return params;
	}

	peekIfNextIsOpenBracket( context ) {

		var tokens = context.tokens;

		if( tokens.length > 0 ) {
			if( tokens[0].type == "bracket" && tokens[0].data == "(") {
				return true;
			}
		}
		return false;
	}

	parseSubExpression( context ) {

		var token = context.tokens.shift();

		if( !(token.type == "bracket" && token.data == "(")) {
			this.throwError( context, "parsing subexpression, expected \"bracket\", not '" + token.data + "'");
		}

		var endTokens = [];
		endTokens.push( { type: "bracket", data: ")" });

		var expr = this.parseBoolExpression( context, endTokens );
		context.tokens.shift();

		expr.type = "expr";
		return expr;
	}


  tokensToString( token )  {
    var str = "";

    if(token.data == "@@@all") {
        str = str + "'" + token.type + "'";
    }
    else {
      //str = str + "'" + token.type + "/" + token.data + "'";
      str = str + "'" + token.data + "'";
    }

    return str;
  }

  endTokensToString( endTokenArray )  {
    var str = "";

    for( var et=0; et<endTokenArray.length; et++) {
      var endToken = endTokenArray[et];

      if( str != "") { str+= " ";}
      str += this.tokensToString( endToken );
    }
    return str;
  }

  isEndToken( token, endTokenArry ) {

    for( var et=0; et<endTokenArry.length; et++) {
      var endToken = endTokenArry[et];

      if( token.type == endToken.type && token.data == endToken.data ) {
        return true;
      }
      else if( token.type == endToken.type && endToken.data == "@@@all" ) {
        return true;
      }
    }
    return false;
  }


  parseSimpleExpression( context, endTokens ) {

    var endLoop;
		var tokens = context.tokens;

    if( tokens.length == 0) {
      return undefined;
    }

		var token, returnValue=undefined;
		token = tokens.shift();

		if( !token ) {
			this.throwError( context, "empty simple expression");
		}

    endLoop = this.isEndToken( token, endTokens );
    if( endLoop ) {
      this.throwError( context, "empty simple expression");
    }


    if( token.type == "op" && token.data == "-" ) {
				var pair = this.parseSimpleExpression( context, endTokens );
        pair[0].data = -pair[0].data;
        return pair;
		}

		if( token.type == "num" ) {
        returnValue= { type: "num", data: token.data };
		}
		else if( token.type == "str" ) {
				returnValue= { type: "str", data: token.data };
		}


    token = tokens.shift();
    if( token ) {
      endLoop = this.isEndToken( token, endTokens );
      if( ! endLoop ) {
        endLoop = context.tokens.length == 0;
      }
      if( !endLoop ) {
        this.throwError( context, "Empty simple expression end expected");
      }
    }

		return [returnValue, token];
	}


  parseBoolExpression( context, endTokens0 ) {

    var endTokens = [];
    var tokens = context.tokens;

    for( var i=0; i < endTokens0.length; i++ ) {
      endTokens.push( endTokens0[ i ] );
    }

    endTokens.push( { type: "bop", data: "OR" });
    endTokens.push( { type: "bop", data: "AND" });

    var first = true;
    var eList = [];
    var op = null;
    while( true ) {

      var expr = this.parseExpression( context, endTokens );
      if( first && tokens.length == 0) {
        return expr;
      }
      first = false;

      var opData = null;
      if( op != null ) {
          opData = op.data;
      }

      //if( expr.parts.length == 1) {
      //    expr.parts[0].op = opData;
      //    expr.parts[0].dbg = "1";
      //    eList.push(  expr.parts[0] );
      //}
      //else {
          expr.op = opData;
          expr.type = "expr";
          expr.dbg = "1";
          eList.push(  expr );
      //}

      if( tokens.length > 0) {
        if( tokens[0].type == "bop" ) {
          var op = tokens.shift();
          continue;
        }
      }
      break;
    }

    if( eList.length == 1 ) {
        eList[0].dbg2 = "len=1";
        return eList[0];
    }


    var retExpr = {
      negate: false,
      binaryNegate: false,
      type: "expr",
      parts: [],
      op: null
    };

    for( i=0; i<eList.length; i++) {
      retExpr.parts.push( eList[ i ] );
    }

    return retExpr;

  }

	parseExpression( context, endTokens ) {

		var tokens = context.tokens;
    if( tokens.length == 0) {
      return null;
    }

		var expression = {
					parts: [],
          negate: false,
          binaryNegate: false
		};

		var index = 0;
		var even = true;
		var op = null;
		var parts = expression.parts;
    var first = true;
    var negate = false;

    var binaryNegate = false;


		while( true ) {
			var token, part;
			token = tokens.shift();

			if( !token ) {
				break;
			}

      var endLoop = this.isEndToken( token, endTokens );
      if( endLoop ) {

        tokens.unshift( token );
        break;
      }

			if( even ) {

				if( token.type == "num" ) {
					part = { type: "num", data: token.data, op: op };
          if( negate ) {
            part.data = -part.data;
          }
					parts.push( part );
          first = false;
          negate = false;
				}
				else if( token.type == "str" ) {
					part = { type: "str", data: token.data, op: op };
					parts.push( part );
          if( negate ) {
            this.throwError( context, "found negation on a string", "type mismatch");
          }
          first = false;
				}
				else if( token.type=="bracket" && token.data=="(") {
						tokens.unshift( token );

            var subEndTokens = [];
            subEndTokens.push( { type: "bracket", data: ")" });

						var expr = this.parseSubExpression( context, subEndTokens );
            expr.op = op;
            expr.negate = negate;
            expr.binaryNegate = binaryNegate;
						parts.push ( expr );
            first = false;
            negate = false;
				}
				else if( token.type=="name" ) {

						var name = token.data;
						var isFunctionCallOrArray = this.peekIfNextIsOpenBracket( context );
            var isUserDefinedFunctionCall = (name == "FN");

						if( isFunctionCallOrArray ) { /*We have a function or an Array */

							token = tokens.shift();
							var parameters = this.parseFunParList( context );
              tokens.shift();

              part = { type: "funCall", params: parameters, op: op, functionName: name };

              if( this.KEYWORDS.indexOf( name ) == -1 ) {
                //isArray  example: x=a(5)
                part = { type: "array", data: name, op: op, indices: parameters };

              }

              if( op == null && negate ) {
                var subExpression = {
                      parts: [part],
                      negate: true,
                      binaryNegate: false,
                      type: "expr"
                };
                parts.push ( subExpression );
              }
							else {
                parts.push ( part );
              }

						}
            else if( isUserDefinedFunctionCall ) {

              token = tokens.shift();
              name = token.data;

              token = tokens.shift();
              var parameters = this.parseFunParList( context ); //TODO limit to 1 par
              tokens.shift();

              part = { type: "defFnCall", params: parameters, op: op, functionName: name };

              if( op == null && negate ) {
                var subExpression = {
                      parts: [part],
                      negate: true,
                      binaryNegate: false,
                      type: "expr"
                };
                parts.push ( subExpression );
              }
							else {
                parts.push ( part );
              }

            }
						else { /* we have an variable*/

							part = { type: "var", data: token.data, op: op };
              if( op == null && negate ) {
                var subExpression = {
                      parts: [part],
                      negate: true,
                      binaryNegate: false,
                      type: "expr"
                };
                parts.push ( subExpression );
              }
              else {
                parts.push ( part );
              }

						}
            negate = false;
            first = false;
				}
        else if( token.type=="op" && token.data=="-" ) {
          negate = ! negate;
          continue;
        }
        else if( token.type=="bop" && token.data=="NOT" && first ) {
          binaryNegate = ! binaryNegate;
          expression.binaryNegate = binaryNegate;
          if( this.debugFlag ) {
            console.log("NOT")
          }
          continue;
        }
				else {
					this.throwError( context, "Expected \"number\", \"string\", \"symbol\" or \"bracket\", not " + token.data);
				}
        op = null;
			}
			else {

				if( token.type == "op" || token.type == "comp" || token.type == "eq" || token.type == "bop" ) {
					op = token.data;
				}
				else {
					this.throwError( context, "Expected \"operator\" or one of ("+
          this.endTokensToString(endTokens)+
          "), not '" + token.data + "'");
				}
			}
			even = !even;

		}

    if( op != null ) {
      part = { type: "uniop", data: null, op: op };
      parts.push ( part );
    }

		if( expression.parts == null ) {
			return null;
		}

    var newParts;
    newParts = this.groupParts( expression.parts, "^" );
    newParts = this.groupParts( newParts, "/" );
    newParts = this.groupParts( newParts, "*" );

    var oldExpression = expression;
    expression = {
          parts: newParts,
          negate: oldExpression.negate,
          binaryNegate: oldExpression.binaryNegate
    };

		return expression;
	}


  groupParts( parts0 , op ) {

    var parts1=[], parts2=[];

    for( var i=0; i<parts0.length; i++ ) {
      parts1.push( parts0[ i ] );
    }

    for( var i=0; i<parts1.length; i++ ) {

      var part = parts1[ i ];
      if( i>0 && part.op == op ) {
        var prevPart = parts1[ i-1 ];

        var subExpr = {
          negate: false,
          binaryNegate: false,
          type: "expr",
          parts: [],
          op: prevPart.op
        };

        subExpr.parts[ 0 ] = prevPart;
        subExpr.parts[ 0 ].op = null;
        subExpr.parts[ 1 ] = part;

        parts1[i-1] = null;
        parts1[ i ] = subExpr;

      }
    }


    for( var i=0; i<parts1.length; i++ ) {

      var part = parts1[ i ];
      if( part != null ) {
        parts2.push( part );
      }
    }

    return parts2;
  }

  normalizeStatementName( x ) {
    if(x == "?") {
      return "print";
    }
    return x;
  }

  parseAssignment( context, preTokens, commands, command, nameToken, token0  ) {

    var token = token0;
		var tokens = context.tokens;

    command.type = "assignment";
    command.var = nameToken;
    command.arrayAssignment = false;

    var endTokens = [];
    endTokens.push( { type: "cmdsep", data: "@@@all" });

    command.expression = this.parseBoolExpression( context, endTokens );
    commands.push( command );
  }

  parseArrayAssignment( context, preTokens, commands, command, nameToken, token0  ) {

    var token = token0;
		var tokens = context.tokens;

    command.type = "assignment";
    command.var = nameToken;
    command.arrayAssignment = true;

    //token = tokens.shift();
    var indices = this.parseFunParList( context );
    command.indices = indices;

    tokens.shift();
    if( this.debugFlag ) {
      console.log("tokens after:",tokens)
    }

    token = tokens.shift();
    if( token === undefined ) {
      token = { type: "@@@notoken" };
    }

    if( token.type != "eq") {
      this.throwError( context, "Expected =");
    }

    var endTokens = [];
    endTokens.push( { type: "cmdsep", data: "@@@all" });

    command.expression = this.parseBoolExpression( context, endTokens );
    commands.push( command );

  }

  parseControlStructure(  context, preTokens, commands, command, handlers, nameToken, token0  ) {

    var token = token0;
		var tokens = context.tokens;

    if( true ) {

      command.type = "control";
      var controlToken = nameToken;
      command.controlKW = nameToken.toLowerCase();
      if( token.type != "@@@notoken") {
        tokens.unshift( token );
      }

      if( controlToken == "LET") {

        token = tokens.shift();
        if( token.type != "name") {
          this.throwError( context, "LET expects var name");
        }
        nameToken = token.data;

        token = tokens.shift();
        if( token === undefined ) {
          token = { type: "@@@notoken" };
        }

/*        if( token.type != "bracket") { #TODO array assignments, ex: LET a(8) = 2
          this.throwError( context, "LET expects =");
        }
*/

        if( token.type == "eq") {

          this.parseAssignment( context, preTokens, commands, command, nameToken, token );
        }
        else if( token.type == "bracket" && token.data=="(" ) {

          this.parseArrayAssignment( context, preTokens, commands, command, nameToken, token );

        }
        else {
          this.throwError( context, "Unexpected data after 'LET': '" + token.data + "'" );
        }

      }
      else if( controlToken == "DIM") {

        var first = true;
        command.params = [];
        command.arrayNames = [];

        while( true ) {

          token = tokens.shift();
          if(!first ) {
            if( token === undefined ) {
              break;
            }
            if( ! ( token.type == "sep" && token.data == "," )) {
              tokens.unshift( token );
              break;
            }
            token = tokens.shift();
          }

          if( token.type != "name" ) {
            this.throwError( context, "DIM expects var name");
          }

          nameToken = token.data;

          token = tokens.shift();
          if( token === undefined ) {
            token = { type: "@@@notoken" };
          }

          if( !(token.type=="bracket" && token.data=="(") ) {
            this.throwError( context, "DIM expects (");
          }

          var indices = this.parseFunParList( context );

          token = tokens.shift();
          if( token === undefined ) {
            token = { type: "@@@notoken" };
          }

          if( !(token.type=="bracket" && token.data==")") ) {
            this.throwError( context, "DIM expects )");
          }

          command.params.push( indices );
          command.arrayNames.push( nameToken );

          first = false;
        }

        commands.push( command );
      }
      else if( controlToken == "DEF") {

        token = tokens.shift();
        if( !( token.type == "name" && token.data == "FN" ) ) {
          this.throwError( context, "DEF expects FN");
        }

        token = tokens.shift();
        if( token.type != "name") {
          this.throwError( context, "DEF FN expects function name");
        }
        var fName = token.data;

        token = tokens.shift();
        if(! ( token.type == "bracket" && token.data == "(" )) {
          this.throwError( context, "DEF FN expects function name and ->( varname )");
        }

        token = tokens.shift();
        if(! ( token.type == "name"  )) {
          this.throwError( context, "DEF FN expects function name and ( ->varname )");
        }
        var varName = token.data;

        token = tokens.shift();
        if(! ( token.type == "bracket" && token.data == ")" )) {
          this.throwError( context, "DEF FN expects function name and ( varname -> )");
        }

        token = tokens.shift();
        if(! ( token.type == "eq" && token.data == "=" )) {
          this.throwError( context, "DEF FN expects function name and ( varname ) -> =");
        }


        endTokens = [];
        var expr_fn = this.parseBoolExpression( context, endTokens );

        if( this.debugFlag ) {
          console.log("expr = " + expr_fn );
        }

        command.params=[];
        command.params[0] = fName;
        command.params[1] = varName;
        command.params[2] = expr_fn;
        commands.push( command );

      }
      else if( controlToken == "GOTO" || controlToken == "GOSUB") {
        var num = -1;

        token = tokens.shift();

        if( token === undefined ) {
          this.throwError( context, "GOTO/GOSUB expects linenumber or label", "undef'd statement");
        }

        if( token.type != "num") {
          //this.throwError( context, "GOTO/GOSUB expects number", "undef'd statement");

          if( token.type != "name") {
              this.throwError( context, "GOTO/GOSUB expects linenumber or label", "undef'd statement");
          }

          var label = token.data;

          token = tokens.shift();
          if( token !== undefined ) {
            if( token.type != "cmdsep") {
              this.throwError( context, "Expected \"command separator\", instead of '"+token.data+"'");
            }
          }

          command.params=[];
          command.params[0] = label;
          command.label = true;
          commands.push( command );
          return;

        }
        num = parseInt(token.data);
        token = tokens.shift();
        if( token !== undefined ) {
          if( token.type != "cmdsep") {
            this.throwError( context, "Expected \"command separator\", instead of '"+token.data+"'");
          }
        }

        command.params=[];
        command.params[0] = num;
        command.label = false;
        commands.push( command );

      }
      else if( controlToken == "ON" ) {
        var nums = [];
        var onInterrupt = false;

        endTokens = [];
        endTokens.push( { type: "name", data: "GOTO" });
        endTokens.push( { type: "name", data: "GOSUB" });

        token = tokens.shift();
        var onExpr = null;

        if( token.type == "name" && (token.data == "INTERRUPT0" || token.data == "INTERRUPT1")) {
          onInterrupt = true;
          onExpr = {
            type: "control",
            data: token.data
          }
        }
        else {
          tokens.unshift( token );
          onExpr = this.parseBoolExpression( context, endTokens );
        }

        token = tokens.shift();
        if( token.type != "name") {
          this.throwError( context, "ON expects GOTO/GOSUB");
        }

        if( !onInterrupt ) {
          if( !( token.data == "GOTO" || token.data == "GOSUB" )) {
            this.throwError( context, "ON expects GOTO/GOSUB");
          }
        }
        else {
          if( !( token.data == "GOTO" )) {
            this.throwError( context, "ON INTERRUPT expects GOTO");
          }
        }

        var onType = token.data;

        token = tokens.shift();

        var labelFlag = false;
        var label = "";
        var num0;

        if( token.type != "num") {

            if( token.type != "name") {
                this.throwError( context, "GOTO/GOSUB expects linenumber or label", "undef'd statement");
            }

            labelFlag = true;
            label = token.data;

        }
        else {
          num0  = parseInt(token.data);
        }

        nums.push( num0 );

        if( !onInterrupt ) {
          while ( true ) {

            token = tokens.shift();
            if( token == undefined ) { break; }
            if( token.type == "cmdsep") { break; }
            if( token.type == "cmdsep") { break; }
            if( !( token.type == "sep" && token.data == "," )) {
              this.throwError( context, "ON GOTO/GOSUB expects numberlist");
            }

            token = tokens.shift();
            if( token.type != "num") {
              this.throwError( context, "GOTO/GOSUB expects number");
            }
            nums.push(  parseInt(token.data) );
          }

          if( nums.length > 1 ) {
            this.throwError( context, "ON INTERUPT GOTO expects only a single line number");
          }

          command.params=[];
          command.params[0] = onType.toLowerCase();
          command.params[1] = onExpr;
          command.params[2] = nums;
          commands.push( command );
        }
        else {

          command.params=[];
          command.params[0] = onExpr.data.toLowerCase();
          if ( labelFlag ) {
              command.params[1] = label;
          }
          else {
              command.params[1] = num0;
          }
          command.label = labelFlag;

          commands.push( command );

        }

      }
      else if( controlToken == "RETURN") {
        var num = -1;

        command.params=[];
        commands.push( command );

      }
      else if( controlToken == "END") {
        var num = -1;

        command.params=[];
        commands.push( command );

      }
      else if( controlToken == "STOP") {
        var num = -1;

        command.params=[];
        commands.push( command );

      }
      else if( controlToken == "FOR") {

        var variable, expr_from, expr_to, expr_step;
        var endTokens = [];

        token = tokens.shift();
        if( token.type != "name" ) {
          this.throwError( context,
                "For expects variable, no var found, found " + token.type+"/"+token.data);
        }

        variable = token.data;

        token = tokens.shift();
        if( !( token.type == "eq" && token.data == "=" )) {
          this.throwError( context,
                "For expects '=', not found, found " + token.type+"/"+token.data);
        }

        endTokens = [];
        endTokens.push( { type: "name", data: "TO" });

        expr_from = this.parseBoolExpression( context, endTokens );

        token = tokens.shift();
        if( !( token.type == "name" && token.data == "TO" ) ) {
          this.throwError( context, "For expects 'to', not found, found " + token.type+"/"+token.data);
        }

        endTokens = [];
        endTokens.push( { type: "cmdsep", data: ":" });
        endTokens.push( { type: "name", data: "STEP" });

        expr_to = this.parseBoolExpression( context, endTokens );
        expr_step = { parts: [ { data: "1", op: null, type: "num"} ] };

        token = tokens.shift();
        if( !( token === undefined ) ) {
          if( token.type == "name" && token.data == "STEP") {

              endTokens = [];
              endTokens.push( { type: "cmdsep", data: ":" });
              expr_step = this.parseBoolExpression( context, endTokens );
          }
          else {
            if(! ( token.type == "cmdsep" && token.data == ":")) {
              throw "FOR: unexpected token '" + token.data +"'";
            }
          }
        }

        command.controlKW = "for:init";
        command.params=[];
        command.params[0] = expr_from;
        command.params[1] = expr_to;
        command.params[2] = expr_step;
        command.variable = variable;
        commands.push( command );
        if( this.debugFlag ) {
          console.log("command=", command);
        }

      }
      else if( controlToken == "NEXT") {

        var variable;

        var explicit = false;
        while( true ) {

          var token = tokens.shift();
          if( ! token ) {
            break;
          }
          if( token.type == "cmdsep" ) {
            break;
          }

          if( token.type != "name" ) {
            throw "Next expected variable, not '" +token.data+ "'";
          }

          var nextcommand = {
            controlKW: "for:next",
            nextVar: token.data,
            lineNumber: command.lineNumber,
            type: command.type
          };

          commands.push( nextcommand );
          explicit = true;

          var token = tokens.shift();
          if( ! token ) {
            break;
          }
          if( token.type == "cmdsep" ) {
            break;
          }
          if( !( token.type == "sep" && token.data == "," )) {
            throw "Expected comma, found '" + token.data + "'";
          }
        }

        if( ! explicit ) {
          command.controlKW = "for:next";
          command.nextVar = null;
          commands.push( command );
        }

      }
      else if( controlToken == "IF") {

        var expr1, expr2, comp;
        endTokens = [];
        endTokens.push( { type: "name", data: "THEN" });
        endTokens.push( { type: "name", data: "GOTO" });
        var expr1 = this.parseBoolExpression( context, endTokens );
        command.params= [ expr1 ];

        token = tokens.shift();

        if( token.type == "name" && token.data == "GOTO") {
          var insert = {};
          insert.data = "GOTO";
          insert.type = "name";
          tokens.unshift( insert );
        } else {
          if( tokens.length > 0 ) {
            if( tokens[0].type == "num" ) {
              var insert = {};
              insert.data = "GOTO";
              insert.type = "name";
              tokens.unshift( insert );
            }
          }
        }

        //var block = this.parseLineCommands( context );
        var result = this.parseLineCommands( context );
        var block = result.commands;

        if( this.debugFlag ) {
          console.log( block );
        }

        commands.push( command );

        for( var bi=0; bi<block.length; bi++) {
          commands.push( block[bi] );
        }

      }
      else if( controlToken == "DATA") {

        var dataArray = [];
        var endTokens;

        endTokens = [];
        endTokens.push( { type: "cmdsep", data: ":" });
        endTokens.push( { type: "sep", data: "," });

        while ( true ) {
            var pair = this.parseSimpleExpression( context, endTokens );

            var expr1 = pair[0];


            if( expr1 === undefined ) {
              throw "DATA: expected data";
            }

            dataArray.push( expr1 );

            token = pair[1];
            if( token === undefined ) {
              break;
            }
            if( token.type == "cmdsep" && token.data == ":" ) {
              break;
            }
            else if( token.type == "sep" && token.data ==",") {
              continue;
            }
            else {
              this.throwError( context, "data unknown token found " + token.type+"/"+token.data);
            }
        }

        command.params=dataArray;
        commands.push( command );

      }
      else if( controlToken == "SUB") {

        var label = "";
        token = tokens.shift();
        if( token == null ) { throw "SUB expected label"; }

        if( token.type != "name" ) {
          throw "SUB expected label not '" +token.data+ "'";
        }

        label = token.data.toUpperCase();

        token = tokens.shift();
        if( token != null ) { throw "SUB unexpected data after label"; }

        command.label = label;
        commands.push( command );

      }
      else if( controlToken == "REM" ) {

        while( true ) {

            token = tokens.shift();
            if( token == null ) { break ; }
        }

        commands.push( command );

      }
      else {
        this.throwError( context, command.controlKW + " not implemented");
      }
    }
  }

  parseStatementCall(  context, preTokens, commands, command, nameToken, token0 ) {

    var token = token0;
		var tokens = context.tokens;

    command.statementName = this.normalizeStatementName( nameToken );
    command.type = "call";


    if( token.type != "@@@notoken") {
      tokens.unshift( token );
    }

    command.params = [];

    while ( true ) {

      var endCommand = false;
      var endTokens = [];
      endTokens.push( { type: "sep", data: "@@@all" });
      endTokens.push( { type: "cmdsep", data: "@@@all" });

      var expression = this.parseBoolExpression( context, endTokens );
      if( this.debugFlag ) {
        console.log( expression );
      }

      if( expression != null ) {
        command.params.push( expression );

        token = tokens.shift();
        if( token != undefined ) {
          if( token === undefined ) {
            endCommand = true;
          }
          if( token.type == "cmdsep" ) {
            endCommand = true;
          }
          else if( token.type == "sep") {
            continue;
          }
          else {
            this.throwError( context, "Unexpected characters in statement call: '" + token.data +"'");
          }
        }
        else {
          endCommand = true;
        }

      }
      else {
        endCommand = true;
      }

      if( endCommand  ) {
        commands.push( command );
        break;
      }
    }
  }

	parseLineCommands( context, preTokens ) {

		var tokens = context.tokens;
		var commands = [];
    var handlers = {};

		var i=1;
		while( true ) {

			var command = {};
			var token;
      var keyword = false;
      var control = false;

			command.lineNumber = context.lineNumber;

			token = tokens.shift();
			if( token === undefined ) {
				break;
			}
			if( token.type == "cmdsep" ) {
				/* empty command */
				continue;
			}

			if( token.type != "name" ) {
				if( token.type != "trash" ) {
          this.throwError( context, "Unexpected token, expected symbolname, got '" + oken.data +"'") ;
        }
        else {
          this.throwError( context, "Unexpected character, expected \"symbolname\", got " + token.detail ) ;
        }
			}

			var nameToken = token.data;
			var cmdType = "unknown";

			if( this.CTRL_KW.indexOf( token.data ) > -1) {
					control = true;
			}

      if( this.KEYWORDS.indexOf( token.data ) > -1 || token.data == "XON") {
					keyword = true;
			}
      else {
        if( this.SHORTCUT_KW.indexOf( token.data ) > -1) {
  					keyword = true;
  			}
      }

		  token = tokens.shift();
			if( token === undefined ) {
				token = { type: "@@@notoken" };
			}

      if (  control ) {

        this.parseControlStructure( context, preTokens, commands, command, handlers, nameToken, token );

      }
			else if( token.type == "eq") {

				this.parseAssignment( context, preTokens, commands, command, nameToken, token );
			}
      else if( token.type == "bracket" && token.data=="(" && !keyword ) {

				this.parseArrayAssignment( context, preTokens, commands, command, nameToken, token );

			}
      else {
          if( !keyword ) {
            console.log("Dump: ",context, preTokens, commands, command, nameToken, token);
            this.throwError( context, "no such command: " + nameToken );
          }
          this.parseStatementCall( context, preTokens, commands, command, nameToken, token );

      }

		}

    var result = {
        commands: commands,
        handlers: handlers
      };

    return result;
	}

  logTokens( tokens ) {
    if( !this.debugFlag ) { return ; }

    var tokensStr = "";
    for( var i=0; i<tokens.length; i++) {
      var tok = tokens[i];
      var tokStr = tok.type + ":" + tok.data;
      if( tokensStr != "" ) {
        tokensStr += ", ";
      }
      tokensStr += tokStr;
    }

    console.log( tokensStr );


    for( var i=0; i<tokens.length; i++) {
        var tok = tokens[i];
        console.log("token: ",tok);
    }

  }




  parseErrorLine( line ) {

    var lineRecord = {
      lineNumber: -1,
      commands: []
    };

    var errContext, detail, lineNr=-1;

    errContext="tokenizer";
    detail="init";
		var toker = new Tokenizer( new StringReader ( line ), this.KEYWORDS );

    detail="parsing tokens";
    var tokens = toker.tokenize();
    if( this.debugFlag ) {
      console.log("Tokens after tokenizer");
    }
    this.logTokens( tokens );

    detail="internal";
    tokens = this.upperCaseNameTokens( tokens );
    tokens = this.removePadding( tokens );
    tokens = this.mergeCompTokens( tokens );
    tokens = this.mergeBrokenUpTokens( tokens );


    if( this.debugFlag ) {
      console.log("Tokens after merge");
    }
    this.logTokens( tokens );

    if( tokens.length == 0 ) {
			return null;
		}

		if( tokens[0].type == "num" ) {
			lineRecord.lineNumber = tokens[0].data;
      lineNr = tokens[0].data;
      var lineRest = line.substr( lineNr.length );
      return this.parseLine( lineNr + " REM[ERROR] " + lineRest  );
    }
    else {
      throw "Expected line number, when reparsing line with error";
    }

  }

  parseLine( line ) {

    var lineRecord = {
      lineNumber: -1,
      commands: []
    };

    var errContext, detail, lineNr=-1;
    try {
      errContext="tokenizer";
      detail="init";
  		var toker = new Tokenizer( new StringReader ( line ), this.KEYWORDS );

      detail="parsing tokens";
      var tokens = toker.tokenize();
      if( this.debugFlag ) {
        console.log("Tokens after tokenizer");
      }
      this.logTokens( tokens );

      detail="internal";
      tokens = this.upperCaseNameTokens( tokens );
      tokens = this.removePadding( tokens );
      tokens = this.mergeCompTokens( tokens );
      tokens = this.mergeBrokenUpTokens( tokens );


      if( this.debugFlag ) {
        console.log("Tokens after merge");
      }
      this.logTokens( tokens );

      if( tokens.length == 0 ) {
  			return null;
  		}

  		if( tokens[0].type == "num" ) {
  			lineRecord.lineNumber = tokens[0].data;
        lineNr = tokens[0].data;
        tokens.shift();
      }

  		var context = {
        tokens: tokens,
        lineNumber: lineRecord.lineNumber
      }

      errContext = "parser";
      detail="parsing commands";
      var result = this.parseLineCommands( context );
      var commands = result.commands;
      lineRecord.commands = commands;
      lineRecord.raw = line;
      lineRecord.handlers = result.handlers;
      return lineRecord;
    }
    catch ( e ) {

      if( this.erh.isError( e ) ) {
        if( e.lineNr == -1 ) {
          if( lineNr != -1 ) {
            e.lineNr = lineNr;
          }
        }
        throw e;
      }
      this.throwError( null, errContext + " error (" +e+ ") while " + detail );
    }
  }

  getTokens( line, merge, noPadding  ) {

    try {
      var toker = new Tokenizer( new StringReader ( line ), this.KEYWORDS );
      var tokens = toker.tokenize();
      if( noPadding) { tokens = this.removePadding( tokens ); }
      if( merge ) {tokens = this.mergeCompTokens( tokens ); }
      this.logTokens( tokens );
      return tokens;
    }
    catch ( e ) {
      console.log( e );
      this.throwError(null,"getTokens error","internal");
    }
  }
}
