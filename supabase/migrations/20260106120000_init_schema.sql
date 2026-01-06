-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES (replaces users table for application logic)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    role TEXT DEFAULT 'user',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger to sync auth.users with public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name', 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to avoid error on repeated runs
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- CLIENTS
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    cnpj TEXT,
    contact_name TEXT,
    email TEXT,
    whatsapp TEXT,
    address TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- SOFTWARES
CREATE TABLE IF NOT EXISTS public.softwares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    version TEXT,
    price_unitary NUMERIC DEFAULT 0,
    price_network NUMERIC DEFAULT 0,
    price_cloud NUMERIC DEFAULT 0,
    update_price NUMERIC DEFAULT 0,
    cloud_update_price NUMERIC DEFAULT 0,
    monthly_fee NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CLIENT_SOFTWARE_LICENSES
CREATE TABLE IF NOT EXISTS public.client_software_licenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    software_id UUID REFERENCES public.softwares(id) ON DELETE SET NULL,
    software_name TEXT,
    type TEXT, -- Unitary, Network, Cloud, Web
    acquisition_date TIMESTAMP WITH TIME ZONE,
    price NUMERIC DEFAULT 0,
    returned BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CLIENT_MONTHLY_FEES
CREATE TABLE IF NOT EXISTS public.client_monthly_fees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    description TEXT, -- Mensalidade Cloud, etc
    value NUMERIC DEFAULT 0,
    due_date TIMESTAMP WITH TIME ZONE,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- SERVICES
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price_client NUMERIC DEFAULT 0,
    price_non_client NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- SUPPLIERS
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    contact TEXT,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- EXPENSE_CATEGORIES
CREATE TABLE IF NOT EXISTS public.expense_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- FINANCIAL_ENTRIES
CREATE TABLE IF NOT EXISTS public.financial_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL, -- receita, despesa
    description TEXT,
    category TEXT,
    value NUMERIC DEFAULT 0,
    date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    due_date TIMESTAMP WITH TIME ZONE,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    client_name TEXT,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    supplier_name TEXT,
    payment_method TEXT,
    observation TEXT,
    license_id UUID REFERENCES public.client_software_licenses(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- OCCURRENCES
CREATE TABLE IF NOT EXISTS public.occurrences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    client_name TEXT,
    solicitor TEXT,
    title TEXT,
    description TEXT,
    status TEXT DEFAULT 'aberta',
    opening_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    deadline TIMESTAMP WITH TIME ZONE,
    closing_date TIMESTAMP WITH TIME ZONE,
    closed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- COMPANY_INFO
CREATE TABLE IF NOT EXISTS public.company_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    cnpj TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    logo_url TEXT
);

-- Insert default company info if not exists
INSERT INTO public.company_info (name, email)
SELECT 'AST7 Gestão', 'suporte@ast7.com.br'
WHERE NOT EXISTS (SELECT 1 FROM public.company_info);

-- Policies (Basic RLS setup for authenticated users)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for authenticated" ON public.clients FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.softwares ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for authenticated" ON public.softwares FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.client_software_licenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for authenticated" ON public.client_software_licenses FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.client_monthly_fees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for authenticated" ON public.client_monthly_fees FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for authenticated" ON public.services FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for authenticated" ON public.suppliers FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for authenticated" ON public.expense_categories FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.financial_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for authenticated" ON public.financial_entries FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.occurrences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for authenticated" ON public.occurrences FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.company_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for authenticated" ON public.company_info FOR ALL USING (auth.role() = 'authenticated');
