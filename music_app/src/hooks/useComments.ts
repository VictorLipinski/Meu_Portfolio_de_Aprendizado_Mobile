import AsyncStorage from '@react-native-async-storage/async-storage'
import { useCallback, useEffect, useState } from 'react'
import { Comment } from '@/types'
import seedComments from '@/data/comments.json'

const STORAGE_KEY = '@noomi:comments'

function makeId(): string {
  return `cmt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

export function useComments(albumId: string) {
  const [allComments, setAllComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  // Comments visible for this specific album
  const comments = allComments.filter((c) => c.albumId === albumId)

  const load = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY)
      if (raw) {
        setAllComments(JSON.parse(raw))
      } else {
        // First run: seed with initial data
        const seed = seedComments as Comment[]
        setAllComments(seed)
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
      }
    } catch {
      // silently ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function persist(updated: Comment[]) {
    setAllComments(updated)
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  async function addComment(
    userId: string,
    userName: string,
    text: string
  ): Promise<void> {
    const newComment: Comment = {
      id: makeId(),
      albumId,
      userId,
      userName,
      comment: text.trim(),
      createdAt: new Date().toISOString(),
    }
    await persist([...allComments, newComment])
  }

  async function editComment(commentId: string, newText: string): Promise<void> {
    await persist(
      allComments.map((c) =>
        c.id === commentId ? { ...c, comment: newText.trim() } : c
      )
    )
  }

  async function deleteComment(commentId: string): Promise<void> {
    await persist(allComments.filter((c) => c.id !== commentId))
  }

  return { comments, loading, addComment, editComment, deleteComment, reload: load }
}
