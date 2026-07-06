CREATE TABLE IF NOT EXISTS public.app_settings (
  id text PRIMARY KEY,
  central_number text NOT NULL DEFAULT '+55 (11) 99876-5432',
  central_label text NOT NULL DEFAULT 'Central de Controle',
  whatsapp_connected boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff read app settings" ON public.app_settings;
CREATE POLICY "Staff read app settings"
ON public.app_settings
FOR SELECT
TO authenticated
USING (app_private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Admins update app settings" ON public.app_settings;
CREATE POLICY "Admins update app settings"
ON public.app_settings
FOR ALL
TO authenticated
USING (app_private.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (app_private.has_role(auth.uid(), 'admin'::public.app_role));

DROP TRIGGER IF EXISTS set_app_settings_updated_at ON public.app_settings;
CREATE TRIGGER set_app_settings_updated_at
BEFORE UPDATE ON public.app_settings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.app_settings (id, central_number, central_label, whatsapp_connected)
VALUES ('main', '+55 (11) 99876-5432', 'Central de Controle', true)
ON CONFLICT (id) DO UPDATE
SET central_number = EXCLUDED.central_number,
    central_label = EXCLUDED.central_label,
    whatsapp_connected = EXCLUDED.whatsapp_connected,
    updated_at = now();

INSERT INTO public.drivers (id, code, name, phone, status, op_status, route, active)
VALUES
  ('00000000-0000-0000-0000-000000000101', 'M-001', 'Ricardo Silva', '+55 (11) 98842-1293', 'online', 'cliente_embarcado', 'Rod. dos Bandeirantes • CD Jundiaí', true),
  ('00000000-0000-0000-0000-000000000102', 'M-002', 'Marcos Oliveira', '+55 (11) 98211-4477', 'idle', 'pausa', 'BR-116 • KM 242', true),
  ('00000000-0000-0000-0000-000000000103', 'M-003', 'Ana Paula Ferreira', '+55 (11) 97744-2210', 'online', 'indo_buscar', 'Marginal Tietê • Rota Centro', true),
  ('00000000-0000-0000-0000-000000000104', 'M-004', 'Thiago Santos', '+55 (11) 96633-8850', 'online', 'disponivel', 'Pátio 3 • Guarulhos', true),
  ('00000000-0000-0000-0000-000000000105', 'M-005', 'André Souza', '+55 (11) 95522-9911', 'offline', 'offline', 'Check-out realizado', true)
ON CONFLICT (id) DO UPDATE
SET code = EXCLUDED.code,
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    status = EXCLUDED.status,
    op_status = EXCLUDED.op_status,
    route = EXCLUDED.route,
    active = EXCLUDED.active,
    updated_at = now();

INSERT INTO public.clients (id, name, phone, favorites, rides_total, last_ride_at, rating, favorite_driver_id, notes)
VALUES
  ('00000000-0000-0000-0000-000000000201', 'João Almeida', '+55 (11) 99111-2020', ARRAY['Aeroporto GRU', 'Av. Paulista, 900'], 15, now() - interval '5 hours', 4.9, '00000000-0000-0000-0000-000000000101', 'Prefere carro grande'),
  ('00000000-0000-0000-0000-000000000202', 'Maria Santos', '+55 (11) 98422-3311', ARRAY['Shopping Ibirapuera', 'Hosp. Sírio-Libanês'], 22, now() - interval '1 day', 5.0, '00000000-0000-0000-0000-000000000103', null),
  ('00000000-0000-0000-0000-000000000203', 'Carlos Nogueira', '+55 (11) 97788-1102', ARRAY['Rodoviária Tietê'], 4, now() - interval '3 days', 4.6, null, null),
  ('00000000-0000-0000-0000-000000000204', 'Beatriz Lima', '+55 (11) 96500-8844', ARRAY['Casa', 'Trabalho — Faria Lima'], 38, now() - interval '7 hours', 4.8, '00000000-0000-0000-0000-000000000104', null)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    favorites = EXCLUDED.favorites,
    rides_total = EXCLUDED.rides_total,
    last_ride_at = EXCLUDED.last_ride_at,
    rating = EXCLUDED.rating,
    favorite_driver_id = EXCLUDED.favorite_driver_id,
    notes = EXCLUDED.notes,
    updated_at = now();

INSERT INTO public.rides (id, client_id, driver_id, origin, destination, price, status, scheduled_for, notes)
VALUES
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000101', 'Aeroporto GRU T3', 'Av. Paulista, 900', 68, 'cliente_embarcado', null, null),
  ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000103', 'Shopping Ibirapuera', 'Hosp. Sírio-Libanês', 42, 'aceita', null, null),
  ('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000203', null, 'Rodoviária Tietê', 'Bairro Vila Mariana', 35, 'procurando', null, null),
  ('00000000-0000-0000-0000-000000000304', '00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000104', 'Casa — Perdizes', 'Trabalho — Faria Lima', 29, 'concluida', null, null),
  ('00000000-0000-0000-0000-000000000305', '00000000-0000-0000-0000-000000000202', null, 'Casa', 'Aeroporto GRU', 85, 'aceita', date_trunc('day', now()) + interval '1 day 5 hours', null)
ON CONFLICT (id) DO UPDATE
SET client_id = EXCLUDED.client_id,
    driver_id = EXCLUDED.driver_id,
    origin = EXCLUDED.origin,
    destination = EXCLUDED.destination,
    price = EXCLUDED.price,
    status = EXCLUDED.status,
    scheduled_for = EXCLUDED.scheduled_for,
    notes = EXCLUDED.notes,
    updated_at = now();

INSERT INTO public.messages (id, driver_id, direction, body, status, kind)
VALUES
  ('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000101', 'in', 'Bom dia, saindo do CD agora com a carga completa.', null, 'text'),
  ('00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000101', 'out', 'Bom dia, Ricardo. Boa viagem. Confirme quando passar pelo pedágio.', 'read', 'text'),
  ('00000000-0000-0000-0000-000000000403', '00000000-0000-0000-0000-000000000102', 'in', 'Pneu furado na BR-116 próximo ao KM 242. Chamando suporte.', null, 'text'),
  ('00000000-0000-0000-0000-000000000404', '00000000-0000-0000-0000-000000000102', 'out', 'Ciente. Acionei a assistência 24h.', 'delivered', 'text')
ON CONFLICT (id) DO UPDATE
SET driver_id = EXCLUDED.driver_id,
    direction = EXCLUDED.direction,
    body = EXCLUDED.body,
    status = EXCLUDED.status,
    kind = EXCLUDED.kind;