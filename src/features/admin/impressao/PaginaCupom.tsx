import { useEffect, useMemo } from "react"
import { useParams, useSearchParams } from "react-router"
import { useSessao } from "@/features/admin/conta/useSessao"
import { formatarDataHora } from "@/lib/datas"
import { formatarMoeda } from "@/lib/moeda"
import { lerParaCupom, marcarImpresso } from "@/mock/pedidos/admin"
import { rotuloPagamento } from "@/mock/regras/rotulos"
import { formatarCep, formatarTelefone } from "@/mock/regras/texto"
import "./cupom.css"

/**
 * Cupom de 80 mm (porte de Areas/Admin/Views/Pedidos/Imprimir.cshtml): preto puro, fonte
 * compacta e negrito forte para a térmica. Marca o pedido como impresso ao abrir.
 * Com ?embutido=1 (iframe da fila) ou ?auto=1, abre o diálogo de impressão sozinho.
 */
export function PaginaCupom() {
  const id = Number(useParams()["id"])
  const [parametros] = useSearchParams()
  const sessao = useSessao()
  const dados = useMemo(() => lerParaCupom(id), [id])
  const auto = parametros.has("auto") || parametros.has("embutido")

  useEffect(() => {
    if (!dados || !sessao) return
    void marcarImpresso(id)
    // O iframe da fila chama print() sozinho; aberto direto com ?auto=1, imprime aqui.
    if (parametros.has("auto")) setTimeout(() => window.print(), 300)
  }, [dados, sessao, id, parametros])

  if (!sessao) return <p className="p-6">Entre no admin para imprimir.</p>
  if (!dados) return <p className="p-6">Pedido não encontrado.</p>

  const { pedido: p, loja, motoboy } = dados
  const origem =
    p.tipo === "Mesa"
      ? `MESA ${p.mesaNumero ?? p.mesaId}`
      : p.tipo === "Entrega"
        ? "ENTREGA"
        : "RETIRADA"

  return (
    <div className="cupom-pagina" data-auto={auto || undefined}>
      <div className="cupom">
        <div className="c">
          <strong>{loja.nomeLoja}</strong>
          {loja.telefone && (
            <>
              <br />
              {loja.telefone}
            </>
          )}
        </div>
        <hr />
        <h1>PEDIDO #{p.id}</h1>
        <div className="c g">{origem}</div>
        <div className="c">{formatarDataHora(p.criadoEm)}</div>
        <hr />
        <div>
          <b>Cliente:</b> {p.clienteNome}
        </div>
        {p.tipo !== "Mesa" && (
          <div>
            <b>Tel.:</b> {formatarTelefone(p.clienteTelefone)}
          </div>
        )}
        {p.tipo === "Entrega" && (
          <>
            <div>
              <b>End.:</b> {p.logradouro}, {p.numero}
              {p.complemento ? ` - ${p.complemento}` : ""}
            </div>
            <div>
              {p.bairro} – {p.cidade}/{p.uf}
            </div>
            <div>CEP {formatarCep(p.cep)}</div>
            {p.referencia && (
              <div>
                <b>Ref.:</b> {p.referencia}
              </div>
            )}
          </>
        )}
        {p.tipo === "Mesa" && (
          <div>
            <b>Local:</b> Salão · Mesa {p.mesaNumero ?? p.mesaId}
            {p.garcomNome ? ` · Garçom: ${p.garcomNome}` : ""}
          </div>
        )}
        <hr />
        <table>
          <tbody>
            {p.itens.map((i) => (
              <ItemCupom
                key={i.id}
                quantidade={i.quantidade}
                nome={i.nomeProduto}
                total={i.total}
                opcoes={i.opcoesResumo}
                observacao={i.observacao}
              />
            ))}
          </tbody>
        </table>
        <hr />
        <table>
          <tbody>
            <tr>
              <td>Subtotal</td>
              <td className="v">{formatarMoeda(p.subtotal)}</td>
            </tr>
            {p.taxaEntrega > 0 && (
              <tr>
                <td>Entrega</td>
                <td className="v">{formatarMoeda(p.taxaEntrega)}</td>
              </tr>
            )}
            <tr className="total">
              <td>TOTAL</td>
              <td className="v">{formatarMoeda(p.total)}</td>
            </tr>
          </tbody>
        </table>
        <hr />
        <div className="g">
          {rotuloPagamento(p.pagamento)} – {p.statusPagamento === "Pago" ? "PAGO" : "COBRAR"}
        </div>
        {p.trocoPara && (
          <div>
            Troco para {formatarMoeda(p.trocoPara)} (levar {formatarMoeda(p.trocoPara - p.total)})
          </div>
        )}
        {p.observacao && (
          <>
            <hr />
            <div className="obs">OBS: {p.observacao}</div>
          </>
        )}
        {motoboy && (
          <>
            <hr />
            <div>
              <b>Motoboy:</b> {motoboy.nome}
            </div>
          </>
        )}
        <hr />
        <div className="c">clickpedido</div>
      </div>
      <button type="button" className="cupom-botao" onClick={() => window.print()}>
        Imprimir
      </button>
    </div>
  )
}

function ItemCupom({
  quantidade,
  nome,
  total,
  opcoes,
  observacao,
}: {
  quantidade: number
  nome: string
  total: number
  opcoes: string | null
  observacao: string | null
}) {
  return (
    <>
      <tr>
        <td>
          <b>
            {quantidade} x {nome}
          </b>
        </td>
        <td className="v">{formatarMoeda(total)}</td>
      </tr>
      {opcoes && (
        <tr>
          <td colSpan={2} className="obs">
            * {opcoes}
          </td>
        </tr>
      )}
      {observacao && (
        <tr>
          <td colSpan={2} className="obs">
            &gt; {observacao}
          </td>
        </tr>
      )}
    </>
  )
}
