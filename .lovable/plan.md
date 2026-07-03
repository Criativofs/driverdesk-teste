
# Pivô: DriverDesk → Central de Corridas ("Uber Particular")

O app hoje é uma central de despacho por WhatsApp com foco em mensagens. Você quer transformar em uma central de corridas onde o operador cria/atribui viagens, acompanha em mapa e mede faturamento. É uma mudança grande de escopo — abaixo o plano em fases para entregar de forma incremental, mantendo o que já existe (inbox, notificações, etiquetas).

## Fase 1 — Núcleo de corridas (o essencial, entrega primeiro)

Cobre itens 1, 3, 4, 5, 10 da sua lista. Ainda com dados mock para iterar rápido no visual/fluxo.

1. **Modelo de dados mock** em `src/lib/mock-data.ts`:
   - `Client` { id, nome, telefone, endereçosFavoritos[], totalCorridas, últimaCorrida, avaliação, obs }
   - `Ride` { id, clienteId, motoristaId?, origem, destino, valor, status, criadaEm, agendadaPara? }
   - `RideStatus`: `procurando` | `aceita` | `indo_buscar` | `cliente_embarcado` | `em_andamento` | `finalizando` | `concluida` | `cancelada`
   - Ampliar `DriverStatus`: `disponivel` | `indo_buscar` | `cliente_embarcado` | `finalizando` | `pausa` | `offline`
2. **Nova seção "Corridas"** na sidebar (torna-se a tela principal, empurra "Painel" para segundo lugar):
   - Tabela: Cliente · Origem · Destino · Valor · Status · Motorista · Ações
   - Filtros por status + busca
   - Botão "Nova corrida" abre dialog (cliente, origem, destino, valor, agendamento opcional)
   - Ações por linha: editar, trocar motorista, cancelar, alterar valor, reenviar ao motorista
3. **Botão "Enviar corrida"** em cada motorista (na lista de motoristas e no dashboard):
   - Abre dialog para escolher corrida pendente
   - Simula envio no WhatsApp: adiciona mensagem outbound formatada ("Nova corrida / Cliente / Origem / Destino / Valor / Aceitar-Recusar") no chat do motorista
4. **Nova seção "Clientes"** com cadastro, lista, e drawer de detalhes (histórico + estatísticas).
5. **Status expandido do motorista** com chip colorido e emoji em toda a UI (sidebar de conversa, dashboard, tabela).

## Fase 2 — Mapa e tempo real (item 2)

- Componente `FleetMap` usando Google Maps via conector Lovable (`google_maps`) — pino por motorista colorido pelo status, popover com nome + ação "Enviar corrida".
- Adiciona `lat`/`lng` mock aos motoristas e atualiza a cada X segundos com pequeno drift para simular movimento.
- Card do dashboard "Frota no mapa" (mini) + rota `/mapa` em tela cheia.
- Requer conectar Google Maps quando você aprovar essa fase.

## Fase 3 — Financeiro, agendamentos e avaliações (itens 6, 7, 8, 11)

- **Dashboard financeiro**: cards de Corridas hoje, Faturamento, Comissão (%), Ticket médio, Tempo médio de espera, Motoristas ativos + gráfico faturamento 14 dias.
- **Corridas agendadas**: aba na tela de Corridas com lista por data/hora e status Confirmado/Pendente.
- **Histórico por cliente**: no drawer do cliente, lista de corridas + motorista favorito calculado.
- **Avaliação pós-corrida**: ao marcar `concluida`, dialog de estrelas + comentário; média exibida no cliente e no motorista.

## Fase 4 — Backend real (Cloud) + integração Meta

Só depois que o fluxo visual estiver aprovado, porque envolve migrations e webhook. Igual ao que já conversamos: ativar Lovable Cloud, tabelas `rides`, `clients`, `ride_events`, endpoint público `/api/public/whatsapp-webhook`, server function `send-whatsapp`, botões "Disponível / Cheguei / Cliente embarcou / Finalizada" mapeados via texto recebido (item 9 — "Área do motorista" por WhatsApp).

## Detalhes técnicos

- Tudo em frontend + mock (`src/lib/mock-data.ts`) nas fases 1–3, com store em memória via `useState`/`useReducer` no topo do `Dashboard` para permitir criar/editar/atribuir corridas sem persistência.
- Nova rota principal continua em `/` — só troca o default section para `rides` em vez de `overview`.
- Componentes novos:
  - `src/components/rides/RidesView.tsx`
  - `src/components/rides/NewRideDialog.tsx`
  - `src/components/rides/AssignDriverDialog.tsx`
  - `src/components/clients/ClientsView.tsx`
  - `src/components/clients/ClientDrawer.tsx`
  - (Fase 2) `src/components/map/FleetMap.tsx`
  - (Fase 3) `src/components/finance/FinanceDashboard.tsx`, `RatingDialog.tsx`
- Etiquetas/prioridades atuais permanecem no inbox — corridas ganham seu próprio conjunto de status.

## Pergunta antes de começar

Você quer que eu **entregue já a Fase 1 completa neste turno** (corridas + clientes + status expandido + botão "Enviar corrida"), ou prefere que eu faça as 4 fases em sequência sem parar? Fase 1 sozinha já é uma mudança grande e vale ver antes de seguir.
