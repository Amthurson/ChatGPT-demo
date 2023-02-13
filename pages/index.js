import Head from "next/head";
import { useState,useMemo, useCallback, useEffect } from "react";
import styles from "./index.module.css";

const settings = {
  questionerName: "敖骏杰", // 提问者名称
  sampleQuestion: "What are you?", // 问题示例
  chatGPTRoleName: "ChatGPT", // ChatGPT回答角色名称
  sampleAnswer: "I am human.", // 回答示例
}

export default function Home() {
  const [animalInput, setAnimalInput] = useState("");
  const [picPrompt, setPicPrompt] = useState("");
  const [picResult, setPicResult] = useState();
  const [result, setResult] = useState();
  const [prompt, setPrompt] = useState("");
  const [question,setQuestion] = useState("");
  const [completions,setCompletions] = useState([]); // 问答数组
  const [loading,setLoading] = useState(false); // 是否加载答案

  async function onSubmit(event) {
    event.preventDefault();
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ animal: animalInput }),
    });
    const data = await response.json();
    setResult(data.result);
    setAnimalInput("");
  }

  async function onSubmitPic(event) {
    event.preventDefault();
    const response = await fetch("/api/image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: picPrompt,
        n: 1,
        size: "1024x1024",
      }),
    });
    const data = await response.json();
    setPicResult(data.result);
    setPicPrompt("");
  }

  function changePromot (event) {
    setPrompt(event.target.value);
  }

  const resetPrompt = async (completions) => {
    let newPromot = '';
    completions.map(v=>{
      newPromot += v.question;
      v.answer.map(v2=>{
        newPromot += v2
      });
      newPromot += '\n\n';
    });
    setPrompt(newPromot);
  }

  let maxLoop = 2;
  // recursion answers
  // const onSubmitDialog = async (e,context="",question="") => {
  //   try {
  //     // set loading
  //     setLoading(true);
  //     // if(!question && !prompt) return;
  //     // set Promt
  //     let input = context;
  //     if(question) {
  //       input = `${question}`+input;
  //       console.log({maxLoop,input,question});
  //       completions.push({question,answer:[]});
  //       setCompletions(completions);
  //     }
  //     // const newPromot = prompt
  //     setQuestion("")
  //     const response = await fetch("/api/generate", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ prompt:input }),
  //     });
  //     const data = await response.json();
  //     const { text, finish_reason } = data.result.choices[0];
  //     completions[completions.length-1].answer.push(text);
  //     setCompletions(completions);
  //     if(finish_reason !== 'stop' && maxLoop>0) {
  //       // setPrompt(context+text);
  //       maxLoop--;
  //       // setPrompt(context+text+'\n\n');
  //       await onSubmitDialog(null,context+text,null);
  //     } else {
  //       await resetPrompt(completions);
  //       setLoading(false);
  //       console.log(completions)
  //       maxLoop = 3;
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }
  
  const changeQuestion = (event) => {
    setQuestion(event.target.value);
  }

  // 将问答记录转为入参prompt
  const setCompletionsToPrompt = (completions) => {
    let newPromot = "";
    completions.map(v=>{
      newPromot += v.question;
      v.answer.map(v2=>{
        newPromot += v2
      });
      newPromot += '\n\n';
    });
    return newPromot;
  }

  // recursion request answer
  const makeRequest = async (newPrompt) =>{
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: newPrompt }),
      });
      const data = await response.json();
      const { text, finish_reason } = data.result.choices[0];
      completions[completions.length-1].answer.push(text);
      setCompletions(completions);
      if(finish_reason !== 'stop' && maxLoop>0) {
        // setPrompt(context+text);
        maxLoop--;
        // setPrompt(context+text+'\n\n');
        return await makeRequest(newPrompt+text);
      } else {
        setLoading(false);
        maxLoop = 3;
        return completions;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  // 设置前置的回答格式示例prompt，用于请求在（对话者名称等）
  const getPromptForm = () => {
    const { questionerName,
      sampleQuestion,
      chatGPTRoleName,
      sampleAnswer } = settings;
    return `${questionerName?`${questionerName}: `:""}${sampleQuestion?sampleQuestion+'\n\n':''}${chatGPTRoleName?`${chatGPTRoleName}: `:""}${sampleAnswer?sampleAnswer+'\n\n':''}`
  }

  // 提问
  const onSubmit2 = async () => {
    // 获取个性化配置（提问者，回答者名称等）
    const { questionerName } = settings;
    // 问题为空，返回
    if(!question) return;
    // 创建一个问答
    completions.push({question:`${questionerName?`${questionerName}: `:""}${question}`,answer:[]});
    setCompletions(completions);
    // 循环请求OpenAI所有回答
    const requestPrompt = getPromptForm() + prompt + `${questionerName?`${questionerName}: `:""}` + question;
    const res = await makeRequest(requestPrompt);
    // 组成新的Prompt
    const newPrompt = setCompletionsToPrompt(res);
    // 重置Prompt给下一次提问准备
    setPrompt(newPrompt);
    console.log({newPrompt,res});
  }
  
  // 合并回答断句
  const combindAnsers = (answers) => {
    let answer = "";
    answers && answers.length>0 && answers.map(v=>{answer+=v});
    return answer.replace('\n','');
  }

  return (
    <div>
      <Head>
        {/* <title>OpenAI Quickstart - Create Template Text</title> */}
        <title>ChatGPT - Demo By Aojunje</title>
        <link rel="icon" href="/dog.png" />
      </Head>

      {/* <main className={styles.main}>
        <img src="/dog.png" className={styles.icon} />
        <h3>Name my pet</h3>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            name="animal"
            placeholder="Enter an animal"
            value={animalInput}
            onChange={(e) => setAnimalInput(e.target.value)}
          />
          <input type="submit" value="Generate names" />
        </form>
        <div className={styles.result}>{result}</div>
      </main> */}

      
      <Head>
      <title>ChatGPT - by Anderson</title>
        {/* <title>OpenAI Quickstart - Create Image By Prompt</title> */}
      </Head>

      <main className={styles.main}>
        <h3>ChatGPT 对话 - By Anderon</h3>
        <div className={styles.dialog}>
          {/* <textarea className={styles.text} readOnly value={prompt}/> */}
          <div className={styles.dialogWrap}>
            {
              completions && completions.length>0 && completions.map((v,i)=>(
                <div className={styles.completions} key={`completion-${i}`}>
                  <div className={styles.questions}>
                    <div className={styles.headimg}>{settings.questionerName?settings.questionerName[0].toUpperCase():''}</div>
                    <div className={styles.content}>{v.question}</div>
                  </div>
                  <div className={styles.answers}>
                    <div className={styles.headimg}>{settings.chatGPTRoleName?settings.chatGPTRoleName[0].toUpperCase():''}</div>
                    <div className={styles.content}>{combindAnsers(v.answer)}</div>
                  </div>
                </div>
              ))
            }
            <div></div>
          </div>
          <div className={styles.inputWrap}>
            <input disabled={loading} onInput={changeQuestion} className={styles.question} type="input" value={question}/>
            <input disabled={loading} onClick={
              // (e)=>onSubmitDialog(e,prompt,question)
              onSubmit2
            } className={styles.button} value="提问" type="button"/>
          </div>
        </div>
      </main>
    </div>
  );
}
