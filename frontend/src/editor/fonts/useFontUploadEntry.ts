import { useCallback } from 'react'
import { useEditor } from '../context'
import { t } from '../strings'
import { useUserFonts } from './userFonts'

export interface FontUploadEntry {
  /** Offered whenever this editor has a writable font library, including local guest mode. */
  available: boolean
  /** Uploading personal fonts never requires signing in. */
  gated: boolean
  /** Opens the local upload dialog directly without account migration. */
  start(): void
}

export function useFontUploadEntry(): FontUploadEntry {
  const editor = useEditor()
  const { canManage } = useUserFonts()
  const start = useCallback(() => {
    if (editor.readOnly) return
    if (!editor.adapter.services.fonts.mine) {
      editor.toast(t.userFonts.errors.unavailable, 'info')
      return
    }
    // Guest editor has an IndexedDB-backed font library. The old account gate
    // silently returned false before it could open the dialog.
    editor.openDialog('upload-font')
  }, [editor])
  return { available: canManage && !editor.readOnly, gated: false, start }
}
