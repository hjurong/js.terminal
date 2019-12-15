// 
/*
 * simple terminal
 */

var Terminal = (function () {
    // PROMPT_TYPE
    var PROMPT_INPUT = 1, PROMPT_PASSWORD = 2, PROMPT_CONFIRM = 3

    var firstPrompt = true;
    promptInput = function (terminal, message, PROMPT_TYPE, callback) {
        var shouldDisplayInput = (PROMPT_TYPE === PROMPT_INPUT)
        var inputField = document.createElement('input')

        inputField.setAttribute('class', 'cmd-cursor-line-input');
        terminal._inputLine.textContent = '';
        terminal._inputLine.appendChild(terminal._cursor);
        terminal._input.style.display = 'block'
        terminal.html.appendChild(inputField)

        if (message.length) terminal.print(PROMPT_TYPE === PROMPT_CONFIRM ? message + ' (y/n)' : message)

        inputField.onblur = function () {
            terminal._cursor.style.display = 'none'
        }

        inputField.onfocus = function () {
            terminal._cursor.style.display = 'inline'
        }

        terminal.html.onclick = function () {
            inputField.focus()
        }

        inputField.onkeydown = function (e) {
            var subcmd = function () {
                var query = '.cmd-output-command[data-index="'+terminal._cmdHistIdx+'"]';
                var cmd = terminal.html.querySelector(query);
                var cmdText = terminal._cmdLineBuf;
                if (cmd) {
                    cmdText = cmd.innerText.substr(terminal._promptText.length);
                } 
                inputField.value = cmdText;
                terminal._render(cmdText);
            }
            if (e.key === 'ArrowUp') {
                if (terminal._cmdHistIdx < 0) {
                    terminal._cmdHistIdx = terminal._cmdIndex;
                    terminal._cmdLineBuf = inputField.value;
                }
                terminal._cmdHistIdx = Math.max(--terminal._cmdHistIdx, 0);
                subcmd();
            } else if (e.key === 'ArrowDown') {
                if (terminal._cmdHistIdx < 0) {
                    terminal._cmdHistIdx = terminal._cmdIndex;
                }
                terminal._cmdHistIdx = Math.min(++terminal._cmdHistIdx, terminal._cmdIndex);
                subcmd();
            } else if (e.key === 'ArrowLeft') {
                terminal._cursorIndex = Math.max(--terminal._cursorIndex, 0);
                terminal._render(inputField.value);
            } else if (e.key == 'ArrowRight') {
                terminal._cursorIndex = Math.min(++terminal._cursorIndex, inputField.value.length);
                terminal._render(inputField.value);
            } else if (shouldDisplayInput && e.which !== 13) {
                setTimeout(function () {
                    terminal._cursorIndex++;
                    terminal._render(inputField.value);
                }, 1)
            }
        }

        inputField.onkeyup = function (e) {
            if (PROMPT_TYPE === PROMPT_CONFIRM || e.which === 13) {
                terminal._cmdHistIdx = -1;
                terminal._cursorIndex = 0;
                terminal._input.style.display = 'none'
                var inputValue = inputField.value;
                if (shouldDisplayInput) { 
                    terminal._print(inputValue, true); 
                }
                terminal.html.removeChild(inputField)
                if (typeof(callback) === 'function') {
                    if (PROMPT_TYPE === PROMPT_CONFIRM) {
                        callback(inputValue.toUpperCase()[0] === 'Y' ? true : false)
                    } else callback(inputValue);
                }
            }
        }
        if (firstPrompt) {
            firstPrompt = false;
            setTimeout(function () { inputField.focus() }, 10);
        } else {
            inputField.focus();
        }
    }

    var TerminalConstructor = function (id, promptText) {
        this.html = document.createElement('div');
        this.html.className = 'Terminal';
        if (typeof(id) === 'string') { 
            this.html.id = id 
        }
        this._promptText = (promptText || '~$').trim() + ' ';
        this._outputIndex = 0;
        this._cmdIndex = 0;
        this._cmdHistIdx = -1;
        this._cmdLineBuf = '';
        this._cursorIndex = 0; 

        this._innerWindow = document.createElement('div');
        this._output = document.createElement('p');
        this._inputLine = document.createElement('span'); 
        this._cmdprompt = document.createElement('span');
        this._cursor = document.createElement('span');
        this._input = document.createElement('p'); 

        this._render = function(message) {
            var cursorLine = '';
            var addCursor = true;
            for (var i=0; i<message.length; i++) {
                var c = message.charAt(i);
                //c = c == ' ' ? '&nbsp;' : c;
                var charSpan = '<span data-text='+c+'><span>' + c + '</span></span>';
                if (this._cursorIndex == i) {
                    charSpan = '<span class="cmd-cursor cmd-blink">' + charSpan + '</span>';
                    addCursor = false;
                }
                cursorLine += charSpan;
           }
           this._inputLine.innerHTML = cursorLine;
           if (addCursor) this._inputLine.appendChild(this._cursor);
        }
                    
        this._print = function (message, iscmd) {
            var newLine = document.createElement('div');
            var msgWrap = document.createElement('pre');
            newLine.setAttribute('class', iscmd ? 'cmd-output-command' : 'cmd-output-messge');
            newLine.setAttribute('data-index',iscmd ? this._cmdIndex : this._outputIndex);
            msgWrap.setAttribute('class', 'cmd-output-wrap');
            msgWrap.textContent = (iscmd ? this._promptText : '') + message;
            newLine.appendChild(msgWrap);
            this._output.appendChild(newLine);
            iscmd ? this._cmdIndex++ : this._outputIndex++;
        }

        this.print = function (message) {
            this._print(message);
        }

        this.input = function (message, callback) {
            promptInput(this, message, PROMPT_INPUT, callback);
        }

        this.password = function (message, callback) {
            promptInput(this, message, PROMPT_PASSWORD, callback);
        }

        this.confirm = function (message, callback) {
            promptInput(this, message, PROMPT_CONFIRM, callback);
        }

        this.clear = function () {
            this._output.innerHTML = '';
        }

        this.sleep = function (milliseconds, callback) {
            setTimeout(callback, milliseconds);
        }

        this._input.appendChild(this._cmdprompt);
        this._input.appendChild(this._inputLine);
        this._inputLine.appendChild(this._cursor);
        this._innerWindow.appendChild(this._output);
        this._innerWindow.appendChild(this._input);
        this.html.appendChild(this._innerWindow);

        this._innerWindow.setAttribute('class', 'cmd');
        this._inputLine.setAttribute('class', 'cmd-cursor-line');
        this._input.style.display = 'none';
        this._input.setAttribute('class', 'terminal-input');
        this._output.setAttribute('class', 'terminal-output');
        this._cursor.innerHTML = '<span><span>&nbsp;</span></span>';  // whitespace
        this._cursor.setAttribute('class', 'cmd-cursor cmd-blink');
        this._cmdprompt.textContent = this._promptText;
        this._cmdprompt.setAttribute('class', 'cmd-prompt');
    }

    return TerminalConstructor;
}())

