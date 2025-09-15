export type QAItem = {
  question: string;
  answer: string;
};

export const FAQ_MOCK: QAItem[] = [
  {
    question: "Wie buche ich eine Session?",
    answer:
      "Wähle dein gewünschtes Datum, die Stadt und den Session-Typ aus und klicke anschließend auf „Jetzt Session finden“. Im nächsten Schritt kannst du die Buchung abschließen.",
  },
  {
    question: "Kann ich meine Buchung stornieren?",
    answer:
      "Ja. Bis 24 Stunden vor Beginn ist eine kostenfreie Stornierung möglich. Danach fallen Stornogebühren an.",
  },
  {
    question: "Welche Zahlungsarten akzeptiert ihr?",
    answer:
      "Kreditkarte, SEPA-Lastschrift und PayPal. Firmenkunden können außerdem per Rechnung zahlen.",
  },
  {
    question: "Brauche ich ein Nutzerkonto?",
    answer:
      "Für Buchungen empfehlen wir ein Konto. So verwaltest du Termine, Rechnungen und Favoriten an einem Ort.",
  },
  {
    question: "Gibt es Gutscheine oder Rabattcodes?",
    answer:
      "Gelegentlich ja. Melde dich für unseren Newsletter an, um aktuelle Aktionen zu erhalten.",
  },
  {
    question: "Wie kontaktiere ich den Support?",
    answer:
      "Schreibe uns über das Kontaktformular oder per E-Mail an support@beispiel.de. Wir antworten in der Regel innerhalb von 24 Stunden.",
  },
];
