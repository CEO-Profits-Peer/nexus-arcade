// ============================================================
//  NEXUS ARCADE — Werbe-Konfiguration
//  Sobald du ein Google AdSense-Konto hast (oder ein anderes Ad-Netzwerk
//  für Spiele, z.B. AdinPlay), trage hier deine Publisher-ID ein:
//    AdSense → Konto → Kontoinformationen → "Publisher-ID" (Format ca-pub-XXXXXXXXXXXXXXXX)
//  Leer = keine Werbung ausgeliefert (ads.js macht dann gar nichts,
//  alle .ad-slot-Flächen bleiben unsichtbar wie bisher).
// ============================================================
window.NEXUS_ADS = {
  adsenseClientId: "",   // z.B. "ca-pub-1234567890123456"

  // Optional: eine responsive AdSense-"Display-Anzeige"-Einheit (im AdSense-
  // Dashboard einmal anlegen, Format "Responsive") für die seitlichen Skyscraper-
  // Flächen (.ad-rail, links+rechts neben jedem Spiel). Eine einzige ID reicht -
  // "Responsive" passt sich automatisch an die (pro Spiel unterschiedliche)
  // Breite der Fläche an. Leer = Rails bleiben unsichtbar, auch wenn oben eine
  // adsenseClientId gesetzt ist.
  railSlotId: "",   // z.B. "1234567890"
};
