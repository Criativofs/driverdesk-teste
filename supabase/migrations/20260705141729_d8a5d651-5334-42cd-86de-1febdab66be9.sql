INSERT INTO public.user_roles (user_id, role)
VALUES ('1e642cb4-4767-4245-89a4-8b736b0ef9e9', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;