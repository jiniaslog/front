import MemoFolderContainer from "@/components/memo/MemoFolderContainer";
import React from "react";

export function renderPage(
  tabs: any,
  path: string,
  page: React.ReactNode
) {
  function renderMemoContainer() {
    return tabs.length > 0 && (path !== "/empty") && path.startsWith('/memo') && (
      <div className="bg-gray-700 p-4 rounded-b-lg overflow-auto">
        <MemoFolderContainer>
          {page}
        </MemoFolderContainer>
      </div>
    );
  }
  
  function renderOthers() {
    return tabs.length > 0 && (path !== "/empty") && (
      <div className="bg-gray-700 p-4 rounded-b-lg">
        {page}
      </div>
    );
  }
  
  return renderMemoContainer() || renderOthers();
}
