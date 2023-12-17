"use client";
import {FolderInfo} from "@/api/models";
import React, {useEffect, useRef, useState} from "react";
import FolderItem from "@/components/memo/FolderItem";
import TabLink from "@/components/link/TabLink";
import MemoItem from "@/components/memo/MemoItem";
import {ContextMenuProps} from "@/components/memo/MemoAndFolderContextMenu";

export function FolderAndMemo({folders, handleContextMenu, contextMenu, underwritingId, newMemoTitle}: {
  folders: FolderInfo[],
  handleContextMenu: (e : React.MouseEvent<HTMLLIElement>, memoId?: string, folderId?: string) => void,
  contextMenu: ContextMenuProps | null,
  underwritingId: string | null | undefined,
  newMemoTitle: string
}) {
  const listRef = useRef<HTMLUListElement>(null);
  
  const scrollToCenter = () => {
    if (listRef.current) {
      const selectedMemoElement = listRef.current.querySelector(`[data-memo-id="${underwritingId}"]`) as HTMLDivElement;
      if (selectedMemoElement) {
        const listHeight = listRef.current.offsetHeight;
        const memoPosition = selectedMemoElement.offsetTop;
        const memoHeight = selectedMemoElement.offsetHeight;
        const centerPosition = memoPosition - (listHeight / 2) + (memoHeight / 2);
        
        listRef.current.scrollTop = centerPosition;
      } else {
        listRef.current.scrollTop = listRef.current.offsetHeight;
      }
    }
  };
  
  useEffect(() => {
    scrollToCenter();
  }, [folders, underwritingId, newMemoTitle]);
  
  const getInitialOpenFolders = () => {
    const storedOpenFolders = localStorage.getItem('openFolders');
    return storedOpenFolders ? new Set(JSON.parse(storedOpenFolders)) : new Set();
  };
  const [openFolders, setOpenFolders] = useState(getInitialOpenFolders);
  
  useEffect(() => {
    localStorage.setItem('openFolders', JSON.stringify(Array.from(openFolders)));
  }, [openFolders]);
  
  const toggleFolder = (folderId: number) => {
    setOpenFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };
  
  const renderItems = (folders: FolderInfo[], depth: number) => {
    return folders.map((folder) => (
      <React.Fragment key={folder.id}>
        <FolderItem
          folder={folder}
          toggleFolder={toggleFolder}
          depth={depth}
          handleContextMenu={handleContextMenu}
          contextMenu={contextMenu}
        />
        {openFolders.has(folder.id ?? 0) && (
          <>
            {folder.memos.map((memo) => (
              <TabLink key={memo.id} href={`/memo/${memo.id}`}
                       name={memo.title !== '' ? memo.title : `/memo/${memo.id}`}>
                <MemoItem
                  memo={memo}
                  handleContextMenu={handleContextMenu}
                  contextMenu={contextMenu}
                  depth={depth}
                  underwritingId={underwritingId}
                  newMemoTitle={newMemoTitle}
                />
              </TabLink>
            ))}
            {folder.children.length > 0 && renderItems(folder.children, depth + 1)}
          </>
        )}
      </React.Fragment>
    ));
  }
  
  return (
    <ul ref={listRef}
        className="flex-grow overflow-auto text-white border-2 bg-gray-900 pt-1">
      {renderItems(folders, 0)}
    </ul>
  )
}
