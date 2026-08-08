// ============================================================
//  NEXUS ARCADE — PRO-Promo-Konfiguration
//  "code" muss als aktiver Promotion Code in Stripe existieren
//  (Dashboard -> Product catalog -> dein PRO-Produkt -> Coupons ->
//  Promotion code anlegen). "percent" ist nur Anzeige im Popup -
//  der tatsächliche Rabatt kommt immer aus Stripe selbst, hier
//  bewusst getrennt damit die Zahl nie auseinanderlaufen kann,
//  ohne dass man aus Versehen den Code falsch abtippt.
//  Ohne einen in Stripe existierenden Code fällt der Checkout
//  automatisch auf den normalen Preis zurück (kein Fehler).
// ============================================================
window.NEXUS_PRO_PROMO = {
  code: "WELCOME20",
  percent: 20,
};
