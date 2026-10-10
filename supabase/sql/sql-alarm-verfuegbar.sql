-- ============================================================================
-- Glocke: Benachrichtigung „Wenn verfügbar“ (ohne Zielpreis)
-- ============================================================================
-- price_alerts.target_price darf leer sein: leer = benachrichtigen, sobald das
-- Produkt in einem Markt erhältlich ist, egal zu welchem Preis. Mit Wert wie
-- bisher Preisalarm. Mehrfach ausführbar.
-- ============================================================================

alter table public.price_alerts alter column target_price drop not null;
comment on column public.price_alerts.target_price is 'Wunschpreis für den Preisalarm; NULL = Benachrichtigung, sobald das Produkt verfügbar ist.';

-- Kontrolle
select column_name, is_nullable from information_schema.columns
 where table_schema = 'public' and table_name = 'price_alerts' and column_name = 'target_price';
