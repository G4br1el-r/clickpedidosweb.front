type Rgb = [number, number, number]

function lerCor(cor: string): Rgb | null {
  const texto = cor.trim().toLowerCase()
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/.exec(texto)?.[1]
  if (hex) {
    const cheio = hex.length === 3 ? [...hex].map((c) => c + c).join("") : hex
    return [0, 2, 4].map((i) => Number.parseInt(cheio.slice(i, i + 2), 16)) as Rgb
  }
  const rgb = /^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/.exec(texto)
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])]
  return null
}

function luminancia([r, g, b]: Rgb): number {
  const canal = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b)
}

/** Razão de contraste da WCAG 2.x entre duas cores (hex ou rgb()). */
export function contraste(a: string, b: string): number | null {
  const corA = lerCor(a)
  const corB = lerCor(b)
  if (!corA || !corB) return null
  const [clara, escura] = [luminancia(corA), luminancia(corB)].sort((x, y) => y - x) as [
    number,
    number,
  ]
  return (clara + 0.05) / (escura + 0.05)
}

export function nivelContraste(razao: number): "AAA" | "AA" | "AA grande" | "Insuficiente" {
  if (razao >= 7) return "AAA"
  if (razao >= 4.5) return "AA"
  if (razao >= 3) return "AA grande"
  return "Insuficiente"
}
