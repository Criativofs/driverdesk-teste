CREATE SCHEMA IF NOT EXISTS app_private;
REVOKE ALL ON SCHEMA app_private FROM PUBLIC;
GRANT USAGE ON SCHEMA app_private TO authenticated;
GRANT USAGE ON SCHEMA app_private TO service_role;

CREATE OR REPLACE FUNCTION app_private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION app_private.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'operator')
  )
$$;

GRANT EXECUTE ON FUNCTION app_private.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION app_private.is_staff(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION app_private.has_role(uuid, public.app_role) TO service_role;
GRANT EXECUTE ON FUNCTION app_private.is_staff(uuid) TO service_role;

ALTER POLICY "Admins delete clients" ON public.clients USING (app_private.has_role(auth.uid(), 'admin'::public.app_role));
ALTER POLICY "Staff insert clients" ON public.clients WITH CHECK (app_private.is_staff(auth.uid()));
ALTER POLICY "Staff read clients" ON public.clients USING (app_private.is_staff(auth.uid()));
ALTER POLICY "Staff update clients" ON public.clients USING (app_private.is_staff(auth.uid())) WITH CHECK (app_private.is_staff(auth.uid()));

ALTER POLICY "Admins delete drivers" ON public.drivers USING (app_private.has_role(auth.uid(), 'admin'::public.app_role));
ALTER POLICY "Staff insert drivers" ON public.drivers WITH CHECK (app_private.is_staff(auth.uid()));
ALTER POLICY "Staff read drivers" ON public.drivers USING (app_private.is_staff(auth.uid()));
ALTER POLICY "Staff update drivers" ON public.drivers USING (app_private.is_staff(auth.uid())) WITH CHECK (app_private.is_staff(auth.uid()));

ALTER POLICY "Staff insert messages" ON public.messages WITH CHECK (app_private.is_staff(auth.uid()));
ALTER POLICY "Staff read messages" ON public.messages USING (app_private.is_staff(auth.uid()));
ALTER POLICY "Staff update messages" ON public.messages USING (app_private.is_staff(auth.uid())) WITH CHECK (app_private.is_staff(auth.uid()));

ALTER POLICY "Admins delete notifications" ON public.notifications USING (app_private.has_role(auth.uid(), 'admin'::public.app_role));
ALTER POLICY "Staff insert notifications" ON public.notifications WITH CHECK (app_private.is_staff(auth.uid()));
ALTER POLICY "Staff read notifications" ON public.notifications USING (app_private.is_staff(auth.uid()) AND (target_user_id IS NULL OR target_user_id = auth.uid()));
ALTER POLICY "Staff update notifications" ON public.notifications USING (app_private.is_staff(auth.uid()) AND (target_user_id IS NULL OR target_user_id = auth.uid())) WITH CHECK (app_private.is_staff(auth.uid()));

ALTER POLICY "Admins delete operators" ON public.operators USING (app_private.has_role(auth.uid(), 'admin'::public.app_role));
ALTER POLICY "Admins insert operators" ON public.operators WITH CHECK (app_private.has_role(auth.uid(), 'admin'::public.app_role) OR auth.uid() = id);
ALTER POLICY "Operator reads own profile" ON public.operators USING (auth.uid() = id OR app_private.is_staff(auth.uid()));

ALTER POLICY "Staff insert ratings" ON public.ratings WITH CHECK (app_private.is_staff(auth.uid()));
ALTER POLICY "Staff read ratings" ON public.ratings USING (app_private.is_staff(auth.uid()));

ALTER POLICY "Staff insert ride_events" ON public.ride_events WITH CHECK (app_private.is_staff(auth.uid()));
ALTER POLICY "Staff read ride_events" ON public.ride_events USING (app_private.is_staff(auth.uid()));

ALTER POLICY "Admins delete rides" ON public.rides USING (app_private.has_role(auth.uid(), 'admin'::public.app_role));
ALTER POLICY "Staff insert rides" ON public.rides WITH CHECK (app_private.is_staff(auth.uid()));
ALTER POLICY "Staff read rides" ON public.rides USING (app_private.is_staff(auth.uid()));
ALTER POLICY "Staff update rides" ON public.rides USING (app_private.is_staff(auth.uid())) WITH CHECK (app_private.is_staff(auth.uid()));

ALTER POLICY "Admins manage roles" ON public.user_roles USING (app_private.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (app_private.has_role(auth.uid(), 'admin'::public.app_role));
ALTER POLICY "Users read own roles" ON public.user_roles USING (auth.uid() = user_id OR app_private.has_role(auth.uid(), 'admin'::public.app_role));

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM authenticated;