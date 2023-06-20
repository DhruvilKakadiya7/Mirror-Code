import React, { useEffect, useRef, useState } from 'react';
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
import CustomInput from './CustomInput';
import OutputDetails from './OutputDetails';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { languageOptions } from '../constants/languageOptions';
import Select from 'react-select';
import SplitPane, { Pane } from 'split-pane-react';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
const Editor = ({ socketRef, roomId, onCodeChange, onInpChnage, onRunChnage, onOutputChange, onLangChange }) => {

    const editorRef = useRef(null);
    const [customInput, setCustomInput] = useState(``);
    const [outputDetails, setOutputDetails] = useState(null);
    const [running, setRunning] = useState(null);
    const [Code, setCode] = useState(``);
    const [languge, setLanguage] = useState(languageOptions[0]);
    const [sizes, setSizes] = useState(['70%', '30%']);

    useEffect(() => {
        async function init() {
            editorRef.current = Codemirror.fromTextArea(
                document.getElementById('Editor'),
                {
                    mode: { name: 'text/x-c++src', json: true },
                    theme: 'monokai',
                    autoCloseTags: true,
                    autoCloseBrackets: true,
                    lineNumbers: true,
                    height: '85vh'
                }
            );
            editorRef.current.setSize(null, 500);
            editorRef.current.on('change', async (instance, changes) => {
                const { origin } = changes;
                const code = instance.getValue();
                setCode(code);
                onCodeChange(code);
                if (origin !== 'setValue') {
                    socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                        roomId,
                        code,
                    });
                }
            });
            const textInp = document.getElementById('custom-input-text');
            // console.log(textInp);
            if (textInp) {
                textInp.addEventListener('input', (event) => {
                    // console.log(textInp.value);
                    onInpChnage(textInp.value);
                    socketRef.current.emit(ACTIONS.CUSTOM_INP_CHANGE, { custInp: textInp.value, roomId });
                })
            }
        }
        init();
    }, []);

    useEffect(() => {
        async function init() {
            if (socketRef.current) {
                socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
                    if (code !== null) {
                        editorRef.current.setValue(code);
                    }
                });

                socketRef.current.on(ACTIONS.COMPILED, ({ outputRes }) => {
                    setOutputDetails(outputRes);
                    setRunning(false);
                    onOutputChange(outputRes);
                    // toast.success('Compiled Successfully.');
                });


                socketRef.current.on(ACTIONS.CUSTOM_INP_CHANGE, ({ custInp }) => {
                    setCustomInput(custInp);
                    onInpChnage(custInp);
                })

                socketRef.current.on(ACTIONS.RUN_CHANGE,({running})=>{
                    setRunning(running);
                    onRunChnage(running);
                });

                socketRef.current.on(ACTIONS.LANG_CHANGE,({lang})=>{
                    // console.log(lang);
                    onLangChange(lang);
                    setLanguage(lang);
                })
            }
        }

        init();
        return () => {
            socketRef.current.off(ACTIONS.CODE_CHANGE);
        };
    }, [socketRef.current]);


    const handleCompile = async () => {
        setRunning(true);
        onRunChnage(true);
        const compileData = {
            language_id: languge.id,
            source_code: btoa(Code),
            stdin: btoa(customInput),
        };
        socketRef.current.emit(ACTIONS.RUN_CHANGE,{running:true,roomId});
        const options = {
            method: 'POST',
            url: process.env.REACT_APP_RAPID_API_URL,
            params: {
                base64_encoded: 'true',
                fields: '*'
            },
            headers: {
                'content-type': 'application/json',
                'Content-Type': 'application/json',
                'X-RapidAPI-Key': process.env.REACT_APP_RAPID_API_KEY,
                'X-RapidAPI-Host': process.env.REACT_APP_RAPID_API_HOST,
            },
            data: compileData
        };
        // console.log(options);
        try {
            const response = await axios.request(options);
            checkStatus(response.data.token);
        } catch (err) {
            let error = err.response ? err.response.data : err;
            setRunning(false);
            onRunChnage(false);
            socketRef.current.emit(ACTIONS.RUN_CHANGE,{running:false,roomId});
            console.log(error);
        }
    };
    const checkStatus = async (token) => {
        const options = {
            method: "GET",
            url: process.env.REACT_APP_RAPID_API_URL + "/" + token,
            params: { base64_encoded: "true", fields: "*" },
            headers: {
                "X-RapidAPI-Host": process.env.REACT_APP_RAPID_API_HOST,
                "X-RapidAPI-Key": process.env.REACT_APP_RAPID_API_KEY,
            },
        };
        try {
            let response = await axios.request(options);
            let statusId = response.data.status?.id;
            if (statusId === 1 || statusId === 2) {
                setTimeout(() => {
                    checkStatus(token)
                }, 2000)
                return
            } else {
                setRunning(false);
                onRunChnage(false);
                setOutputDetails(response.data);
                onOutputChange(response.data);
                socketRef.current.emit(ACTIONS.COMPILED, { outputRes: response.data, roomId });
                toast.success('Compiled Successfully.');
                return
            }
        } catch (err) {
            console.log("err", err);
            setRunning(false);
            onRunChnage(false);
            socketRef.current.emit(ACTIONS.RUN_CHANGE,{running:false,roomId});
            toast.error('Compilation failed');
        }
    };

    const clrInpOut = async () => {
        setCustomInput(``);
        setOutputDetails(null);
        socketRef.current.emit(ACTIONS.CUSTOM_INP_CHANGE, { custInp: ``, roomId });
        socketRef.current.emit(ACTIONS.COMPILED, { outputRes: null, roomId });
    };

    const onSelectChange = (sl) => {
        // console.log(sl);
        onLangChange(sl);
        socketRef.current.emit(ACTIONS.LANG_CHANGE,{lang:sl,roomId});
        setLanguage(sl);
    };
    // onLangChange(languageOptions[0]);
    return (
        <div id="xxx ">
            <div className="mainEditor">
                <SplitPane
                    split='vertical'
                    sizes={sizes}
                    onChange={setSizes}
                >
                    <Pane minSize='40%' maxSize='80%'>
                        <div className='left-container'>
                            <textarea id="Editor"></textarea>
                        </div>
                    </Pane>
                    <div className='right-container'>
                        <div className='lang-select'>
                            <Select
                                placeholder={`Filter By Category`}
                                options={languageOptions}
                                value={languge}
                                onChange={(selectedOption) => onSelectChange(selectedOption)}
                            />
                        </div>
                        <h4 className='inp-out'>Input:</h4>
                        <div className='input-box'>
                            <CustomInput
                                customInput={customInput}
                                setCustomInput={setCustomInput}
                                socketRef={socketRef}
                                roomId={roomId}
                            />
                        </div>
                        <div className='run'>
                            <button className="run-btn" onClick={handleCompile}>
                                <PlayArrowIcon sx={{ fontSize: 20 }}></PlayArrowIcon>
                                {running ? "Running..." : "Run"}
                            </button>
                        </div>
                        <h4 className='inp-out'>Output:</h4>
                        <div className='output-box'>
                            <OutputDetails
                                outputDetails={outputDetails}
                            >
                            </OutputDetails>
                        </div>
                        <div className='clear'>
                            <button className="clear-btn" onClick={clrInpOut}>
                                Clear
                            </button>
                        </div>
                    </div>
                </SplitPane>
            </div>


        </div >

    );
};

export default Editor;

