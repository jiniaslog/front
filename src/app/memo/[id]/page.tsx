"use client";
import MemoEditor from "@/components/MemoWebsocket";

export default function Page({params} : {params: {id: string}}) {
  const id = params.id;
  return (
    <main className="dos-font">
      <MemoEditor memoId = {id}/>
    </main>
  )
}
