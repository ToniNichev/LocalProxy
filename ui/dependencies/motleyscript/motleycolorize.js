/**
 *
 */

function MotleyColorize() {

	this.Object = null;


	this._indentation = '&nbsp;&nbsp;&nbsp;&nbsp;';
	this.singletonHTMLTags = {input:1, br:1, '!--':1};
	this._lastIndentationIndex = 0;
	this._whitespace_replace_sumbol = '*--_--*-_-';
	this.curly_bks_open_replace_sumbol = '#-_--_-!';
	this.curly_bks_open_replace_sumbol = '#---!--_-';
	this.colon_replace_sumbol = '**__*-_-_*-';
	/**
	 * @param jQuery object <Object>
	 */
	this.init = function (Object) {

		this.Object = Object;
		var self = this;

		this.motleyIndent =

		this.Object.keyup(function(event) {
			if(event.keyCode == 224 || event.keyCode == 13 || event.keyCode == 8 || event.keyCode==46 || (event.keyCode >= 37 && event.keyCode <= 40)) {
				// return if ctl, return, arrows, del, delete
				return;
			}

		    var containerEl = self.Object[0];
		    var savedSel = self.saveSelection(containerEl);

		    //self.colorise();

		    self.restoreSelection(containerEl, savedSel);
		    return false;
		});
	}




	/**
	 * Colorize code
	 */
	this.colorise = function() {

		var htmlText = this.Object.html();

		// preserve br tag
		htmlText = htmlText.split("</br>").join('&br;');
		htmlText = htmlText.split("<br>").join('&br;');

		// strip all tags
		var div = document.createElement("div");
		div.innerHTML = htmlText;
		var text = div.textContent || div.innerText || "";

		// colorize tags like <tag>some text</tag>
		text = text.replace(/<(\/?)([^>^)]+)>/g, "<{{*mots_red*}}$1$2{{**}}>");

		// colorize variable value pairs like myvar=23
		text = text.replace(/(\w+)(\s)?=(\s)?('|")?([\w ' : ; -]+)('|"|\s|;|)/g, "{{*mots_prop*}}$1{{**}}$2=$3$4{{*mots_prop_val*}}$5{{**}}$6");

		// colorize text inside quotes
		text = text.replace(/"([^"]+)"/g, '"{{*mots_quotes*}}$1{{**}}"');

		// escape these
		text = text.split('<').join('&lt;');
		text = text.split('>').join('&gt;');

		// restore the new lines
		text = text.split('&br;').join('</br>');

		//alert(text);

		text = this.replaceWithStyle(text);

		this.Object.html(text);
	}


	/**
	 * @param DOMObject containerEl
	 */

	this.saveSelection = function(containerEl) {
	    var charIndex = 0;
	    var start = 0;
	    var end = 0;
	    var foundStart = false
	    var stop = {};
	    var sel = window.getSelection();
	    var range;

	    function traverseTextNodes(node, range) {
	        if (node.nodeType == 3) {
	            if (!foundStart && node == range.startContainer) {
	                start = charIndex + range.startOffset;
	                foundStart = true;
	            }
	            if (foundStart && node == range.endContainer) {
	                end = charIndex + range.endOffset;
	                throw stop;
	            }
	            charIndex += node.length;
	        } else {
	            for (var i = 0, len = node.childNodes.length; i < len; ++i) {
	                traverseTextNodes(node.childNodes[i], range);
	            }
	        }
	    }

	    if (sel.rangeCount) {
	        try {
	            traverseTextNodes(containerEl, sel.getRangeAt(0));
	        } catch (ex) {
	            if (ex != stop) {
	                throw ex;
	            }
	        }
	    }

	    return {
	        start: start,
	        end: end
	    };
	}



	/**
	 *
	 */

	this.restoreSelection = function(containerEl, savedSel) {
	    var charIndex = 0, range = document.createRange(), foundStart = false, stop = {};
	    range.setStart(containerEl, 0);
	    range.collapse(true);

	    function traverseTextNodes(node) {
	        if (node.nodeType == 3) {
	            var nextCharIndex = charIndex + node.length;
	            if (!foundStart && savedSel.start >= charIndex && savedSel.start <= nextCharIndex) {
	                range.setStart(node, savedSel.start - charIndex);
	                foundStart = true;
	            }
	            if (foundStart && savedSel.end >= charIndex && savedSel.end <= nextCharIndex) {
	                range.setEnd(node, savedSel.end - charIndex);
	                throw stop;
	            }
	            charIndex = nextCharIndex;
	        } else {
	            for (var i = 0, len = node.childNodes.length; i < len; ++i) {
	                traverseTextNodes(node.childNodes[i]);
	            }
	        }
	    }

	    try {
	        traverseTextNodes(containerEl);
	    } catch (ex) {
	        if (ex == stop) {
	            var sel = window.getSelection();
	            sel.removeAllRanges();
	            sel.addRange(range);
	        } else {
	            throw ex;
	        }
	    }
	}


	/**
	 * ############################################################
	 * Helper functions
	 * ############################################################
	 */

	/**
	 * Does the final replacement of {classname} with the <span class=classname">
	 */
	this.replaceWithStyle = function(text) {
		text = text.replace(/{{\*(\w+)\*}}/g, "<span class  ='$1'>");
		text = text.split('{{\*\*}}').join('</span>');
		//var text = text.replace(reg_exp, replacement);
		return text;

	}

	/**
	 *
	 */
	this._indent = function(indent) {
		var whitespace = '';
		for(var q=0;q<indent;q++) {
			whitespace = whitespace + this._indentation;
		}
		return whitespace;
	}

	/**
	 * Strips whitespace
	 */
	this.getInnerText = function() {
		var text = this.Object.text();
		text = text.replace(/\s{2,}/g, ''); // matches space at least two times and removes it
		return text;
	}

	/**
	 * Splits the string by spaces, then counts the quotes
	 *  and finds out if the quote is: opened, opened and closed or closed in the splitted section.
	 */
	this.preserveWhitespaceInQuotes = function(txt) {
		var splitStr = txt.split('');
		var result = '';
		var space = '';
		var s_quote_open = false;
		var d_quote_open = false;
		for(var q = 0;q< splitStr.length;q++) {
			// Quotes opening or closing
			if( splitStr[q] == "'")
				s_quote_open = s_quote_open ? false : true;
			if( splitStr[q] == '"')
				d_quote_open = d_quote_open ? false : true;


			if(s_quote_open || d_quote_open) {
				// if quotes are open, escape space, '{', '}'
				var escapedText = splitStr[q];

				switch(escapedText) {
				case '{':
					escapedText = this.curly_bks_open_replace_sumbol;
					break;
				case '}':
					escapedText = this.curly_bks_close_replace_sumbol;
				case ':':
					escapedText = this.colon_replace_sumbol;
					break;
				case ' ':
					escapedText = this._whitespace_replace_sumbol;
				}

				result +=  escapedText ;
			}
			else
				result += splitStr[q];

		}
		return result;
	}
}