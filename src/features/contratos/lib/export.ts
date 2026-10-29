import type { DocumentoNegociacao } from '@/features/consignacao/api/types';

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const replacements: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return replacements[character];
  });
}

/** Self-contained export: no external fonts, scripts, resources or unescaped user HTML. */
export function documentoHtml(documento: DocumentoNegociacao): string {
  const status =
    documento.status === 'minuta'
      ? 'MINUTA — NÃO ASSINADA'
      : 'DOCUMENTO EMITIDO — AGUARDANDO ASSINATURA';
  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'">
<title>${escapeHtml(documento.titulo)}</title>
<style>
@page{size:A4;margin:20mm 18mm}*{box-sizing:border-box}body{max-width:780px;margin:32px auto;padding:0 24px;background:#fff;color:#17202a;font-family:Georgia,'Times New Roman',serif;font-size:12pt;line-height:1.6}header{border-bottom:1px solid #aab3bd;padding-bottom:14px;margin-bottom:22px}h1{font-size:19pt;line-height:1.3;margin:8px 0}.status{font:700 10pt Arial,sans-serif;letter-spacing:.04em}.meta,footer{font:9pt/1.5 Arial,sans-serif;color:#475569;overflow-wrap:anywhere}.content{white-space:pre-wrap;overflow-wrap:anywhere}footer{border-top:1px solid #cbd5e1;margin-top:24px;padding-top:12px}aside{border:1px solid #b45309;padding:12px;margin-bottom:20px;font:10pt/1.5 Arial,sans-serif}@media print{body{max-width:none;margin:0;padding:0}header{break-inside:avoid}footer{break-inside:avoid}.content{orphans:3;widows:3}}
</style></head><body>
<header><div class="status">${status}</div><h1>${escapeHtml(documento.titulo)}</h1><div class="meta">Documento ${escapeHtml(documento.id)} · Modelo ${escapeHtml(documento.versaoModelo)}<br>Registrado em ${escapeHtml(documento.emitidoEm)} · Versão do cadastro ${documento.snapshot.versao}</div></header>
${documento.pendencias.length ? `<aside><strong>Pendências da minuta:</strong><ul>${documento.pendencias.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></aside>` : ''}
<main class="content">${escapeHtml(documento.conteudo)}</main>
<footer>SHA-256 do conteúdo: ${escapeHtml(documento.sha256)}<br>A emissão e o código de integridade não comprovam a assinatura das partes. Conserve a via assinada e suas evidências junto a este registro.</footer>
</body></html>`;
}

export function downloadDocumento(documento: DocumentoNegociacao): void {
  const blob = new Blob([documentoHtml(documento)], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `contrato-${documento.modeloId}-${documento.id}.html`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function printDocumento(documento: DocumentoNegociacao): void {
  const frame = document.createElement('iframe');
  frame.title = 'Impressão do contrato';
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  frame.setAttribute('aria-hidden', 'true');
  frame.addEventListener(
    'load',
    () => {
      if (!frame.contentWindow) return;
      frame.contentWindow.focus();
      frame.contentWindow.print();
    },
    { once: true }
  );
  frame.srcdoc = documentoHtml(documento);
  document.body.append(frame);
  // Printing can be asynchronous across browsers. Keep the document alive until the dialog closes.
  setTimeout(() => frame.remove(), 120000);
}
