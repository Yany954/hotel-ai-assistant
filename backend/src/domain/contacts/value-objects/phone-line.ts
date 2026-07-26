// A single phone number tied to a specific purpose. Most contacts have exactly one; some
// (CLC, with 7 lines for accounting/contracts/after-hours/etc.) have several.

export interface PhoneLine {
  purpose: string;              // short label, e.g. "wifi_issues", "after_hours", "accounting"
  phoneNumber: string;
  contactPersonName?: string;   // e.g. "Cassandra" for Southern Glazer's, "Mary" for Intech
}
