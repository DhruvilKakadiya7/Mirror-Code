import React, { useEffect, useRef } from 'react';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/monokai.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/theme/xq-dark.css'
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/clike/clike';
import 'codemirror/mode/python/python';
import 'codemirror/mode/css/css';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../Actions';
import guessProgrammingLanguage from 'guess-programming-language'

const Editor = ({ socketRef, roomId, onCodeChange }) => {
    const editorRef = useRef(null);
    useEffect(() => { 
        async function init() {
            editorRef.current = Codemirror.fromTextArea(
                document.getElementById('Editor'),
                {
                    mode: { name: 'htmlmixed', json: true },
                    theme: 'monokai',
                    autoCloseTags: true,
                    autoCloseBrackets: true,
                    lineNumbers: true,
                }
            );
            editorRef.current.setSize(null,500);
            editorRef.current.on('change', async (instance, changes) => {
                // clearTimeout(pending);
                // pending = setTimeout(update(instance), 400);
                const { origin } = changes;
                const code = instance.getValue();
                let lang = await guessProgrammingLanguage(code);
                // console.log("1",lang);
                if(lang === 'apache' || lang==='xml'){
                    lang = 'htmlmixed'
                }
                else if(lang === 'crystal'){
                    lang = 'javascript'
                }
                else if(lang === 'css'){
                    lang = 'css'
                }
                else if(lang==='cpp'){
                    lang = 'text/x-c++src';
                }
                else if(lang === 'python' || lang==='routeros' || lang==='isbl'){
                    lang = 'python'
                }
                else{
                    lang = 'javascript'
                }
                // console.log(lang);
                editorRef.current.setOption("mode",lang);
                onCodeChange(code);
                if (origin !== 'setValue') {
                    socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                        roomId,
                        code,
                    });
                }
            });
        }
        init();
    }, []);

    useEffect(() => {
        async function init(){
            if (socketRef.current) {
                socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
                    // console.log(code);
                    if (code !== null) {
                        editorRef.current.setValue(code);
                    }
                });
            }
        }
        
        init();
        return () => {
            socketRef.current.off(ACTIONS.CODE_CHANGE);
        };
    }, [socketRef.current]);

    return (
        <div id="xxx">
            <textarea id="Editor"></textarea>
        </div>
        
    );
};

export default Editor;
