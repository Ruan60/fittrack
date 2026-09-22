import { supabase } from '@/lib/supabase'

const MAX_INPUT_BYTES = 8 * 1024 * 1024

/** Redimensiona para 256x256 (corte central) e converte para JPEG */
async function toSquareJpeg(file: File, size = 256): Promise<Blob> {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = () => reject(new Error('Não foi possível ler a imagem.'))
      i.src = url
    })
    const side = Math.min(img.width, img.height)
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Não foi possível processar a imagem.')
    ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size)
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Falha ao converter imagem.'))), 'image/jpeg', 0.85),
    )
  } finally {
    URL.revokeObjectURL(url)
  }
}

export const avatarService = {
  async upload(userId: string, file: File): Promise<string> {
    if (!file.type.startsWith('image/')) throw new Error('Selecione um arquivo de imagem.')
    if (file.size > MAX_INPUT_BYTES) throw new Error('Imagem muito grande (máximo 8 MB).')
    const blob = await toSquareJpeg(file)
    const path = `${userId}/avatar-${Date.now()}.jpg`
    const { error } = await supabase.storage.from('avatars').upload(path, blob, {
      contentType: 'image/jpeg',
      upsert: true,
      cacheControl: '3600',
    })
    if (error) throw error
    return supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl
  },
}
