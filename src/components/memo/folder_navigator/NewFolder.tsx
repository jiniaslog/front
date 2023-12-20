"use client";

import React, {Dispatch, SetStateAction} from "react";
import {FolderInfo, SimpleMemoInfo} from "@/api/models";
import {createFolder} from "@/api/memo";
import Image from "next/image";
import newFolder from "../../../../public/newFolder.png";

export default function NewFolder({foldersRef, setFoldersRef}: {
  foldersRef: FolderInfo[],
  setFoldersRef: Dispatch<SetStateAction<FolderInfo[]>>,
}) {
  const createNewFolder = async () => {
    const response = await createFolder("1");
    const newFolderId = response.folderId;
    const newFolderName = response.folderName;
    
    const unCategoryFolder = foldersRef.find((folder) => folder.id === null);
    const newFolder: FolderInfo = {
      id: newFolderId,
      name: newFolderName,
      children: [],
      memos: [],
      parent: null,
    };
    const newFolders = [...foldersRef.filter((folder) => folder.id !== null), newFolder];
    if (unCategoryFolder) {
      newFolders.push(unCategoryFolder);
    }
    setFoldersRef(newFolders);
  };
  
  return (
    <div className="tooltip">
      <div onClick={createNewFolder}>
        <button
          className="text-white hover:text-gray-300 ml-3 mr-3"
          aria-label='newMemo'
          type='button'
        >
          <Image src={newFolder} alt={"newMemo"}
                 className={"white-image"}
                 width={30} height={30}/>
        </button>
        <span className="tooltip-message">새 폴더</span>
      </div>
    </div>
  );
}
