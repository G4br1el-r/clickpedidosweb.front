// Fotos do Unsplash por URL direta (sem baixar arquivo), com crédito ao autor.
// Os produtos fora desta lista ficam sem foto de propósito, para o placeholder também ser desenhado.

interface FotoProduto {
  foto: string
  autor: string
  usuario: string
}

const fotos: Record<number, FotoProduto> = {
  1: { foto: "photo-1634069564622-99a828554a02", autor: "mk. s", usuario: "mk__s" },
  7: {
    foto: "photo-1586190848861-99aa4a171e90",
    autor: "David Foodphototasty",
    usuario: "phototastyfood",
  },
  9: {
    foto: "photo-1648221410814-9d45c9ab144b",
    autor: "Tá Focando",
    usuario: "tafocandofotoefilme",
  },
  10: {
    foto: "photo-1552718752-c682d315b136",
    autor: "amirali mirhashemian",
    usuario: "amir_v_ali",
  },
  12: { foto: "photo-1572406318005-189545eed2c4", autor: "Jessica Weiller", usuario: "jweiller" },
  13: { foto: "photo-1590288488147-f46142daf112", autor: "Mitch Fox", usuario: "mitchellf0x" },
  15: { foto: "photo-1550259114-ad7188f0a967", autor: "Fernando Andrade", usuario: "thisisnando" },
  16: {
    foto: "photo-1676468426928-e28a3ba5f5a9",
    autor: "Ray Hedgehog digital",
    usuario: "rayhannah",
  },
  17: { foto: "photo-1670122113520-3539738abb8f", autor: "de___ch", usuario: "de___ch" },
  19: {
    foto: "photo-1624291144860-5eb9ea390785",
    autor: "Pranjall Kumar",
    usuario: "pranjallk1995",
  },
  25: { foto: "photo-1562166453-2783119c313a", autor: "Vicky Ng", usuario: "vickyng" },
  35: { foto: "photo-1647705195905-671a25be159d", autor: "henry perks", usuario: "hjkp" },
  39: { foto: "photo-1639744210631-209fce3e256c", autor: "Jay Gajjar", usuario: "jaygajjar" },
  42: {
    foto: "photo-1766566959672-257837bc6c76",
    autor: "dika Mahendra",
    usuario: "dhykamahendra",
  },
}

export function urlFoto(idFoto: string, largura = 640): string {
  return `https://images.unsplash.com/${idFoto}?w=${largura}&q=70&auto=format&fit=crop`
}

export function fotoDoProduto(produtoId: number): string | null {
  const foto = fotos[produtoId]
  return foto ? urlFoto(foto.foto) : null
}

export const creditosFotos: Record<number, { autor: string; link: string }> = Object.fromEntries(
  Object.entries(fotos).map(([id, f]) => [
    Number(id),
    {
      autor: f.autor,
      link: `https://unsplash.com/@${f.usuario}?utm_source=clickpedido&utm_medium=referral`,
    },
  ]),
)
