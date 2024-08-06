import { type SimpleMemoInfo } from '../(domain)/memo'
import { type Folder, folderFinder, folderManager } from '../(domain)/folder'
import { atom, useAtom } from 'jotai'
import {
  createFolder,
  createMemo,
  deleteFolderById,
  deleteMemoById,
  fetchFolderAndMemo,
  fetchReferencedByMemoId,
  fetchReferencesByMemoId,
  fetchSearchResults,
  makeRelationshipWithFolders,
  makeRelationshipWithMemoAndFolders
} from '../(infra)/memo'

const folderAtom = atom<Folder[]>([])

export const useFolderAndMemo = (): {
  folders: Folder[]
  setFolders: (folders: Folder[]) => void
  initializeFolderAndMemo: () => Promise<void>
  createNewFolder: () => Promise<void>
  searchMemo: (value: string) => Promise<void>
  deleteFolder: (folderId: string) => Promise<Folder[]>
  fetchReferenceMemos: (targetMemoId: string) => Promise<void>
  createNewMemo: () => Promise<string>
  writeNewMemoTitle: (memoId: string, newTitle: string) => void
  makeRelationshipAndRefresh: ({ id, type }: { id: number, type: string }, targetFolderId: number | null) => Promise<void>
  deleteMemo: (memoId: string) => Promise<void>
} => {
  const [folders, setFoldersAtom] = useAtom(folderAtom)

  const setFolders = (folders: Folder[]): void => {
    setFoldersAtom(folders)
  }

  const initializeFolderAndMemo = async (): Promise<void> => {
    await fetchAndSetFolders()
  }

  const createNewFolder = async (): Promise<void> => {
    const newFolder = await createFolder()

    function orderedNewFolders (newFolder: Folder): Folder[] {
      const unCategorizedFolder = folderFinder.findUnCategorizedFolder(folders)
      const newFolders = [...folders.filter((folder) => folder.id !== null), newFolder]
      if (unCategorizedFolder != null) {
        newFolders.push(unCategorizedFolder)
      }
      return newFolders
    }

    const newFolders = orderedNewFolders(newFolder)
    setFolders(newFolders)
  }

  const searchMemoAndFolders = async (value: string): Promise<void> => {
    const folders = await fetchSearchResults(value)
    if (folders == null) {
      throw new Error('폴더 검색에 실패했습니다.')
    }
    setFolders(folders)
  }

  const deleteFolder = async (folderId: string): Promise<Folder[]> => {
    const result = await deleteFolderById(folderId.toString())
    if (result != null) {
      // refresh
      await fetchAndSetFolders()
    }
    return folders
  }

  async function fetchAndSetFolders (): Promise<void> {
    const fetchedFolders = await fetchFolderAndMemo()
    if (fetchedFolders === null) {
      throw new Error('폴더 정보를 가져오는데 실패했습니다.')
    }
    setFoldersAtom(fetchedFolders)
  }

  const fetchReferenceMemos = async (targetMemoId: string): Promise<void> => {
    const references = await fetchReferencesByMemoId(targetMemoId) ?? []
    const referenced = await fetchReferencedByMemoId(targetMemoId) ?? []
    const newFolders = folderManager.buildReferenceFolders(references, referenced)
    setFolders(newFolders)
  }

  const createNewMemo = async (): Promise<string> => {
    const memo = await createMemo()
    if (memo == null) {
      throw new Error('메모 생성에 실패했습니다.')
    }
    const newMemo: SimpleMemoInfo = { id: memo.memoId, title: '', references: [] }
    const newFolders = folderManager.rebuildFoldersAtIncludingNewMemo(folders, newMemo)
    setFolders(newFolders)
    return memo.memoId.toString()
  }

  const writeNewMemoTitle = (memoId: string, newTitle: string): void => {
    const newFolders = folderManager.rebuildFoldersAtUpdatingMemoTitle(folders, memoId, newTitle ?? '')
    setFolders(newFolders)
  }

  const makeRelationshipAndRefresh = async ({ id, type }: {
    id: number
    type: string
  }, targetFolderId: number | null): Promise<void> => {
    if (type === 'memo') {
      const result = await makeRelationshipWithMemoAndFolders(id.toString(), targetFolderId?.toString() ?? null)
      if (result != null) {
        await fetchAndSetFolders()
      } else {
        console.log('fail')
      }
    } else if (type === 'folder') {
      const result = await makeRelationshipWithFolders(id.toString(), targetFolderId?.toString() ?? null)
      if (result != null) {
        await fetchAndSetFolders()
      } else {
        console.log('fail')
      }
    }
  }

  const deleteMemo = async (memoId: string): Promise<void> => {
    await deleteMemoById(memoId)
    const newFolderStructure = folderManager.rebuildFoldersAtDeletingMemo(folders, memoId)
    setFolders(newFolderStructure)
  }

  return {
    initializeFolderAndMemo,
    folders,
    setFolders,
    createNewFolder,
    searchMemo: searchMemoAndFolders,
    deleteFolder,
    fetchReferenceMemos,
    createNewMemo,
    writeNewMemoTitle,
    makeRelationshipAndRefresh,
    deleteMemo
  }
}
