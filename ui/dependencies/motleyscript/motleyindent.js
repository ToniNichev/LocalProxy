/**
 *
 * @returns {MotleyScript}
 */

function MotleyIndent() {

	this.Object = null;
	this._currentIndentationLevel = 0;
	this.caretPosition = 0;
	this.textArray = [];
	this.lastNodeType = 'tag';
	this.domObject = [];


	this._indentation = '&nbsp;&nbsp;&nbsp;&nbsp;';

	// html configs
	this.config_singleton_html_tags = /(<\s*meta)|<\s*br|<!/gi;


	/**
	 * @param jQuery object <Object>
	 */
	this.init = function (Object) {
		this.Object = Object;
		var self = this;

		//this.motleyIndent =

		this.Object.keyup(function(event) {
			if(event.keyCode == 224 || event.keyCode == 13 || event.keyCode == 8 || event.keyCode==46 || (event.keyCode >= 37 && event.keyCode <= 40)) {
				// return if ctl, return, arrows, del, delete
				return;
			}

		    var containerEl = self.Object[0];
		    return false;
		});
	}



	/**
	 * Add language indentation
	 */
	this.indentText = function() {

		var text = this.Object.html();
		text = this.htmlToPlainText(text);
		// remove the new lines
		text = text.split(/\n*/g).join('');
		// converts Non-breaking space to regular spaces
		text = text.split(String.fromCharCode(160)).join(' ');

		// split by letters
		this.textArray = text.split('');


		this.caretPosition = 0;

		var result = '';
		var line = '';
		var char = '';
		for(this.caretPosition = 0; this.caretPosition < this.textArray.length; this.caretPosition++) {
			char = this.textArray[this.caretPosition];
			line += char;

			switch(char) {
			case '<':
				result += this.insideTag();
				break;
			default:
				result += this.compileCommonCases();
				if(char!='\n' && char != ' ')
				this.lastNodeType = 'text';
				break;
			}

		}

		result = result.split('<').join('&lt;');
		result = result.split('>').join('&gt;');
		result = result.split('\n').join('<br>');
	    this.Object.html(result);
	}


	/**
	 * _insideQuotes
	 */
	this._insideQuotes = function() {
		var quoteType =  this.textArray[this.caretPosition] == '"' ? 'double' : 'single';
		var result =  this.textArray[this.caretPosition];
		var line = '';
		var char = '';
		for(this.caretPosition=this.caretPosition+1; this.caretPosition < this.textArray.length; this.caretPosition++) {
			char = this.textArray[this.caretPosition];
			line += char;
			switch(char) {
				case '"':
					result += '"';
					if(quoteType == 'double') {
						return result;
					}
					break;
				case "'":
					result += "'";
					if(quoteType == 'single') {
						return result;
					}
					break;
				case ' ':
					result += '&nbsp;';
					break;
				default:
					result += char;
					break;

			}
		}
		return result;
	}

	/**
	 * insideTag
	 */
	this.insideTag = function() {
		var result =  '<'; // the opening tag
		var line = '';
		var char = '';
		var prevChar = '';
		for(this.caretPosition=this.caretPosition+1; this.caretPosition < this.textArray.length; this.caretPosition++) {
			char = this.textArray[this.caretPosition];
			line += char;

			switch(char) {
				case '>':	// closing the tag name
					result += '>';
					if(line.match(/\/[^>]*>/i) == null) {
						// this is opening tag
						result =  this._indent() + result;
						console.log(line);
						this._currentIndentationLevel ++;
					}
					else {
						// this is closing tag
						this._currentIndentationLevel --;
						result =  this._indent() + result;
						result =  result + '\n';
					}
					return result;
					break;
				case ' ':	// converts multiple spaces to single space
					if(prevChar != ' ')
						result += ' ';
					break;
				default:
					result += this.compileCommonCases();
					break;

			}
			prevChar = char;
		}
		return result;
	}


	/**
	 * compileCommonCases - checks if certain cases match like 'inside quotes' and calls the appropriate function
	 * 	otherwise it justs adds the current character to the return array.
	 */
	this.compileCommonCases = function() {
		var char = this.textArray[this.caretPosition];
		var result = '';
		if(char =='"' || char=="'") {
			// preserve text in quotes
			result = this._insideQuotes();
		}else {
			result = char;
		}
		return result;
	}

	/**
	 * Converts html text to plain text
	 * Replaces <br> with \n
	 *
	 * @param string htmlText
	 * $return string text
	 */
	this.htmlToPlainText = function(htmlText) {
		//htmlText = htmlText.split("\n").join('');
		htmlText = htmlText.split(/<br\s?\/?>/).join('\n');
		var div = document.createElement("div");
		div.innerHTML = htmlText;
		text = div.textContent || div.innerText || "";
		return text;
	}

	/**
	 * Helper functions
	 */

	this._indent = function() {
		var whitespace = '';
		for(var q=0;q<this._currentIndentationLevel;q++) {
			whitespace = whitespace + this._indentation;
		}
		return whitespace;
	}

}