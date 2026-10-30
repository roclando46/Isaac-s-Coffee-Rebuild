import { boolean, date, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

const created = () => timestamp("created_at", { withTimezone: true }).defaultNow().notNull();

/** A cart sent to Stripe. The webhook reads it back when payment succeeds. */
export const checkouts = pgTable("checkouts", {
  id: uuid("id").primaryKey().defaultRandom(),
  kind: text("kind", { enum: ["shop", "drinks"] }).notNull(),
  payload: jsonb("payload").notNull(), // CheckoutRequest or drinks request
  giftCardId: uuid("gift_card_id"),
  giftCardApplied: integer("gift_card_applied").default(0).notNull(),
  stripeSessionId: text("stripe_session_id"),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: created(),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  number: integer("number").generatedAlwaysAsIdentity({ startWith: 2001 }),
  kind: text("kind", { enum: ["shop", "drinks"] }).notNull(),
  stripeSessionId: text("stripe_session_id").notNull().unique(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  email: text("email").notNull(),
  name: text("name"),
  items: jsonb("items").notNull(),
  delivery: text("delivery"),
  address: jsonb("address"),
  amountTotal: integer("amount_total").notNull(),
  amountDiscount: integer("amount_discount").default(0).notNull(),
  hasOneOffCoffee: boolean("has_one_off_coffee").default(false).notNull(),
  pickupAt: text("pickup_at"), // drinks, "HH:MM" UK time on the order day
  status: text("status", { enum: ["paid", "ready", "collected"] }).default("paid").notNull(),
  reorderReminderSentAt: timestamp("reorder_reminder_sent_at", { withTimezone: true }),
  createdAt: created(),
});

/** Every parcel or collection the café has to pack: one-off orders, subscription renewals, gift subscription boxes. */
export const shipments = pgTable("shipments", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id"),
  source: text("source", { enum: ["order", "renewal", "giftsub"] }).notNull(),
  stripeInvoiceId: text("stripe_invoice_id").unique(),
  email: text("email").notNull(),
  name: text("name"),
  address: jsonb("address"),
  delivery: text("delivery").notNull(),
  items: jsonb("items").notNull(), // [{ slug, name, size, grind, qty, giftMessage }]
  giftMessage: text("gift_message"),
  dueOn: date("due_on").notNull(),
  status: text("status", { enum: ["due", "dispatched"] }).default("due").notNull(),
  trackingNumber: text("tracking_number"),
  dispatchedAt: timestamp("dispatched_at", { withTimezone: true }),
  reviewRequestSentAt: timestamp("review_request_sent_at", { withTimezone: true }),
  createdAt: created(),
});

export const giftCards = pgTable("gift_cards", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  initialAmount: integer("initial_amount").notNull(),
  balance: integer("balance").notNull(),
  purchaserEmail: text("purchaser_email").notNull(),
  recipientEmail: text("recipient_email").notNull(),
  recipientName: text("recipient_name"),
  message: text("message"),
  sendOn: date("send_on").notNull(),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  orderId: uuid("order_id"),
  createdAt: created(),
});

export const subscribers = pgTable("subscribers", {
  email: text("email").primaryKey(),
  status: text("status", { enum: ["pending", "active", "unsubscribed"] }).notNull(),
  source: text("source").notNull(), // "footer", "checkout", "import"
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  createdAt: created(),
});

/** Customers who turned off reorder reminders and review requests. */
export const optOuts = pgTable("opt_outs", {
  email: text("email").primaryKey(),
  createdAt: created(),
});

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  productSlug: text("product_slug").notNull(),
  shipmentId: uuid("shipment_id"),
  email: text("email").notNull(),
  name: text("name").notNull(),
  rating: integer("rating").notNull(),
  body: text("body").notNull(),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).default("pending").notNull(),
  createdAt: created(),
});
