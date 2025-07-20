import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  duration: integer("duration").notNull(), // duration in minutes
  category: text("category").notNull(), // 'hair' or 'nails'
  requiresDownPayment: boolean("requires_down_payment").notNull().default(false),
  downPaymentAmount: decimal("down_payment_amount", { precision: 10, scale: 2 }),
  imageUrl: text("image_url"),
});

export const staff = pgTable("staff", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  experience: text("experience").notNull(),
  imageUrl: text("image_url"),
  specialties: text("specialties").array(),
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  serviceId: integer("service_id").references(() => services.id).notNull(),
  staffId: integer("staff_id").references(() => staff.id).notNull(),
  appointmentDate: timestamp("appointment_date").notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'confirmed', 'completed', 'cancelled'
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  downPaymentAmount: decimal("down_payment_amount", { precision: 10, scale: 2 }),
  downPaymentPaid: boolean("down_payment_paid").notNull().default(false),
  remainingAmount: decimal("remaining_amount", { precision: 10, scale: 2 }).notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
});

export const insertStaffSchema = createInsertSchema(staff).omit({
  id: true,
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
});

export const bookingFormSchema = z.object({
  serviceId: z.number(),
  staffId: z.number(),
  appointmentDate: z.string(),
  appointmentTime: z.string(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
});

export type Service = typeof services.$inferSelect;
export type Staff = typeof staff.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type BookingForm = z.infer<typeof bookingFormSchema>;

export interface AppointmentWithDetails extends Appointment {
  client: Client;
  service: Service;
  staff: Staff;
}

// Relations
export const servicesRelations = relations(services, ({ many }) => ({
  appointments: many(appointments),
}));

export const staffRelations = relations(staff, ({ many }) => ({
  appointments: many(appointments),
}));

export const clientsRelations = relations(clients, ({ many }) => ({
  appointments: many(appointments),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  client: one(clients, {
    fields: [appointments.clientId],
    references: [clients.id],
  }),
  service: one(services, {
    fields: [appointments.serviceId],
    references: [services.id],
  }),
  staff: one(staff, {
    fields: [appointments.staffId],
    references: [staff.id],
  }),
}));
