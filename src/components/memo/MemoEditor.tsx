"use client";
"use strict";

import React, {useState, useEffect, useRef, useContext, Suspense} from 'react';
import SockJS from 'sockjs-client';
import {Client, Stomp} from '@stomp/stompjs';
import MDEditor, {
  codeEdit,
  codeLive,
  codePreview,
  divider, executeCommand, ExecuteState, fullscreen,
  ICommand, selectWord, TextAreaTextApi
} from '@uiw/react-md-editor';
import {fetchMemoById, fetchRelatedMemo} from "@/api/memo";
import {Memo} from "@/domain/Memo";
import {RelatedMemoModal} from "@/components/memo/RelatedMemoModal";
import {usePathname} from "next/navigation";
import {TabBarContext} from "@/components/DynamicLayout";
import MemoTable from "@/components/memo/MemoTable";
import {MixedSizes, Panel, PanelGroup, PanelResizeHandle} from "react-resizable-panels";
import {getLocalStorage, setLocalStorage} from "@/utils/LocalStorage";

export default function MemoEditor({pageMemoId, memos}: {
  pageMemoId?: string,
  memos: Memo[],
}) {
  const [stompClient, setStompClient] = useState<Client | null>(null);
  // memo
  const [memoId, setMemoId] = useState<string | null>(pageMemoId ? pageMemoId !== "new" ? pageMemoId : null : null);
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const titleRef = useRef(title);
  const contentRef = useRef(content);
  // component
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recommendations, setRecommendations] = useState<Memo[]>([]);
  const [resolveSelection, setResolveSelection] = useState<(value: any) => void | null>();
  
  const path = usePathname();
  
  const getCustomExtraCommands: () => ICommand[] = () => [referenceLink, codeEdit, codeLive, codePreview, divider, fullscreen];
  
  useEffect(() => {
    const socket = new SockJS('http://localhost:7777/memo');
    const client = Stomp.over(socket);
    
    client.connect({}, () => {
      setStompClient(client);
    });
    
    if (pageMemoId && pageMemoId !== "new") { // memoId == pageMemoId인 경우
      handlePageArgMemoId();
    }
    
    return () => {
      if (client) {
        client.disconnect();
      }
    };
  }, []);
  
  useEffect(() => {
    if (stompClient && !memoId) { // memoId가 없는 경우
      subscribeMemo();
      initMemo();
    }
    if (memoId == "pending") { // memoId가 pending인 경우
      return;
    }
    
    if (memoId && memoId !== "pending" && path == "/memo/new") { // memoId가 new인 경우
      const updatedTab = {...tabs[selectedTabIdx], context: `/memo/${memoId}`, name: `/memo/${memoId}`};
      const newTabs = [
        ...tabs.slice(0, selectedTabIdx),
        updatedTab,
        ...tabs.slice(selectedTabIdx + 1)
      ];
      setTabs(newTabs);
    }
  }, [stompClient, memoId]);
  
  const {tabs, selectedTabIdx, setTabs, setSelectedTabIdx} = useContext(TabBarContext);
  
  const subscribeMemo = () => {
    if (stompClient) {
      stompClient.subscribe(`/topic/memoResponse`, (response) => {
        handleResponse(JSON.parse(response.body));
      });
    }
  }
  
  const handleResponse = (response: any) => {
    if (response.type === "InitMemoInfo") {
      setMemoId(response.id);
    }
  }
  
  const initMemo = () => {
    if (stompClient) {
      let command = {
        type: "InitMemo",
        authorId: 1,
        title: title,
        content: content,
      };
      
      stompClient.publish({
        destination: "/app/initMemo",
        body: JSON.stringify(command)
      });
      setMemoId("pending");
    }
  };
  
  function handlePageArgMemoId() {
    fetchMemoById(pageMemoId!!).then((memo) => {
        if (!memo) {
          return;
        }
        setMemoId(pageMemoId!!);
        setTitle(memo.title);
        setContent(memo.content);
      }
    );
  }
  
  useEffect(() => {
    titleRef.current = title;
    contentRef.current = content;
  }, [title, content]);
  
  useEffect(() => {
    if (!stompClient || !memoId) {
      return;
    }
    
    const timer = setInterval(() => {
      updateMemo();
    }, 1000);
    
    return () => clearInterval(timer);
  }, [stompClient, memoId]);
  
  const updateMemo = () => {
    if (stompClient && memoId) {
      let command = {
        type: "UpdateMemo",
        id: memoId,
        title: titleRef.current,
        content: contentRef.current,
      };
      
      stompClient.publish({
        destination: "/app/updateMemo",
        body: JSON.stringify(command)
      });
    }
  };
  
  const referenceLink: ICommand = {
    name: 'referenceLink',
    keyCommand: 'referenceLink',
    shortcuts: 'ctrlcmd+r',
    prefix: '[',
    suffix: ']',
    buttonProps: {'aria-label': 'Add reference (ctrl + r)', title: 'Add reference (ctrl + r)'},
    icon: (
      <svg data-name="italic" width="12" height="12" role="img" viewBox="0 0 520 520">
        <path
          fill="currentColor"
          d="M331.751196,182.121107 C392.438214,241.974735 391.605313,337.935283 332.11686,396.871226 C332.005129,396.991316 331.873084,397.121413 331.751196,397.241503 L263.493918,464.491645 C203.291404,523.80587 105.345257,523.797864 45.151885,464.491645 C-15.0506283,405.187427 -15.0506283,308.675467 45.151885,249.371249 L82.8416853,212.237562 C92.836501,202.39022 110.049118,208.9351 110.56511,222.851476 C111.223305,240.5867 114.451306,258.404985 120.407566,275.611815 C122.424812,281.438159 120.983487,287.882964 116.565047,292.23621 L103.272145,305.332975 C74.8052033,333.379887 73.9123737,379.047937 102.098973,407.369054 C130.563883,435.969378 177.350591,436.139505 206.033884,407.879434 L274.291163,340.6393 C302.9257,312.427264 302.805844,266.827265 274.291163,238.733318 C270.531934,235.036561 266.74528,232.16442 263.787465,230.157924 C259.544542,227.2873 256.928256,222.609848 256.731165,217.542518 C256.328935,206.967633 260.13184,196.070508 268.613213,187.714278 L289.998463,166.643567 C295.606326,161.118448 304.403592,160.439942 310.906317,164.911276 C318.353355,170.034591 325.328531,175.793397 331.751196,182.121107 Z M240.704978,55.4828366 L172.447607,122.733236 C172.325719,122.853326 172.193674,122.983423 172.081943,123.103513 C117.703294,179.334654 129.953294,261.569283 185.365841,328.828764 C191.044403,335.721376 198.762988,340.914712 206.209732,346.037661 C212.712465,350.509012 221.510759,349.829503 227.117615,344.305363 L248.502893,323.234572 C256.984277,314.87831 260.787188,303.981143 260.384957,293.406218 C260.187865,288.338869 257.571576,283.661398 253.328648,280.790763 C250.370829,278.78426 246.58417,275.912107 242.824936,272.215337 C214.310216,244.121282 206.209732,204.825874 229.906702,179.334654 L298.164073,112.094263 C326.847404,83.8340838 373.633159,84.0042113 402.099123,112.604645 C430.285761,140.92587 429.393946,186.594095 400.92595,214.641114 L387.63303,227.737929 C383.214584,232.091191 381.773257,238.536021 383.790506,244.362388 C389.746774,261.569283 392.974779,279.387637 393.632975,297.122928 C394.149984,311.039357 411.361608,317.584262 421.356437,307.736882 L459.046288,270.603053 C519.249898,211.29961 519.249898,114.787281 459.047304,55.4828366 C398.853851,-3.82360914 300.907572,-3.83161514 240.704978,55.4828366 Z"
        />
      </svg>),
    execute: async (state: ExecuteState, api: TextAreaTextApi) => {
      let newSelectionRange = selectWord({
        text: state.text,
        selection: state.selection,
        prefix: state.command.prefix!,
        suffix: state.command.suffix,
      });
      let selectedWord = api.setSelectionRange(newSelectionRange);
      const recommendedArr = await fetchRelatedMemo(selectedWord.selectedText, memoId!!);
      console.log(recommendedArr)
      setRecommendations(recommendedArr);
      
      const selectedValue: any = await openModalWithSelection();
      
      executeCommand({
        api,
        selectedText: selectedWord.selectedText,
        selection: state.selection,
        prefix: state.command.prefix!,
        suffix: state.command.suffix + "(http://localhost:3000/memo/" + selectedValue.memoId + ")",
      });
      // }
    }
  };
  
  const openModalWithSelection = () => {
    setIsModalOpen(true);
    return new Promise((resolve) => {
      setResolveSelection(() => resolve);
    });
  };
  
  const handleSelect = (value: Memo) => {
    if (resolveSelection) resolveSelection(value);
    setIsModalOpen(false);
  };

  const onLayout = (layout: MixedSizes[]) => {
    setLocalStorage("react-resizable-panels:layout", layout);
  };
  
  const defaultLayout = getLocalStorage<MixedSizes[] | null>("react-resizable-panels:layout")
  
  return (
    <PanelGroup
      direction="horizontal"
      className={"dos-font flex-col md:flex-row"}
      style={{ height: '65vh', overflowY: 'auto' }}
      onLayout={onLayout}
    >
      <Panel
        defaultSizePercentage={defaultLayout ? defaultLayout[0].sizePercentage : 70}
        className={"bg-black text-green-400 font-mono p-4 flex flex-grow md:w-80"}
        minSizePercentage={20}
      >
        <div className="flex-grow">
          {/*title*/}
          <div className="mb-4">
            <input
              className="bg-gray-900 text-green-400 p-2 mb-2 w-full outline-none caret-green-400 focus:outline-none"
              type="text"
              placeholder="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          {/*editor*/}
          <div className="mb-4">
            <RelatedMemoModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              contents={(
                <ul className="list-none space-y-2">
                  {recommendations.map((recommendation, index) => (
                    <li
                      key={index}
                      className="cursor-pointer p-2 hover:bg-gray-700 rounded transition duration-150 ease-in-out"
                      onClick={() => handleSelect(recommendation)}
                    ><span>{"> "}</span>
                      {recommendation.title}
                    </li>
                  ))}
                </ul>
              )}
            />
            
            <MDEditor
              value={content}
              extraCommands={getCustomExtraCommands()}
              onChange={(value) => {
                if (typeof value === 'string') {
                  setContent(value);
                }
              }}
              height={400}
              visibleDragbar={false}
            />
          </div>
        </div>
      </Panel>
      <PanelResizeHandle className="w-2 hover:bg-blue-800" />
      <Panel
        defaultSizePercentage={defaultLayout ? defaultLayout[1].sizePercentage : 30}
        className="flex flex-1 overflow-auto"
        minSizePercentage={20}
      >
      <Suspense>
        <MemoTable memos={memos}
                   underwritingId={memoId}
                   underwritingTitle={title}
                   className="flex flex-1 min-w-0"/>
      </Suspense>
      </Panel>
    </PanelGroup>
  );
}
