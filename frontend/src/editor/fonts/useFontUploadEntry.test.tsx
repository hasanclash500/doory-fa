import { act, cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { createBlankDocument } from '@/lib/document'
import type { FontFamily } from '@/types/api'
import { EditorProvider } from '../EditorProvider'
import { DialogHost } from '../dialogs/DialogHost'
import { createMemoryAdapter } from '../dev/memoryAdapter'
import { EditorEngine } from '../engine/editor'
import { YourFonts } from './YourFonts'

afterEach(() => { cleanup() })

it('opens the font file chooser for a guest without requesting an account', async () => {
  const handle = createMemoryAdapter()
  const requireAccount = vi.fn(async () => false)
  handle.adapter.requireAccount = requireAccount
  handle.adapter.services.fonts.mine = {
    list: async () => [] as FontFamily[],
    upload: async () => { throw new Error('Upload not used during chooser test') },
    remove: async () => undefined,
  }
  const engine = new EditorEngine({
    adapter: handle.adapter,
    document: createBlankDocument(800, 600),
    meta: { id: 'local1', title: 'Local guest', mode: 'guest' },
    ephemeral: true,
  })
  engine.start()
  const wrap = (children: ReactNode) => (
    <EditorProvider engine={engine} portalRoot={document.body}>
      {children}
      <DialogHost onTitle={() => undefined} />
    </EditorProvider>
  )
  try {
    render(wrap(<YourFonts />))
    const button = await screen.findByTestId('your-fonts-upload')
    await userEvent.click(button)
    const input = await screen.findByTestId('font-file-input')
    expect(input).toHaveAttribute('type', 'file')
    expect(input).not.toBeDisabled()
    expect(input).toHaveAttribute('accept', expect.stringContaining('.ttf'))
    expect(requireAccount).not.toHaveBeenCalled()
  } finally {
    act(() => engine.dispose())
  }
})
