import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertClientSchema, insertAppointmentSchema, bookingFormSchema } from "@shared/schema";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all services
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getAllServices();
      res.json(services);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching services: " + error.message });
    }
  });

  // Get all staff
  app.get("/api/staff", async (req, res) => {
    try {
      const staff = await storage.getAllStaff();
      res.json(staff);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching staff: " + error.message });
    }
  });

  // Get all appointments
  app.get("/api/appointments", async (req, res) => {
    try {
      const appointments = await storage.getAllAppointments();
      res.json(appointments);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching appointments: " + error.message });
    }
  });

  // Create appointment
  app.post("/api/appointments", async (req, res) => {
    try {
      const bookingData = bookingFormSchema.parse(req.body);
      
      // Check if client exists or create new one
      let client = await storage.getClientByEmail(bookingData.email);
      if (!client) {
        client = await storage.createClient({
          firstName: bookingData.firstName,
          lastName: bookingData.lastName,
          email: bookingData.email,
          phone: bookingData.phone,
        });
      }

      // Get service details
      const service = await storage.getServiceById(bookingData.serviceId);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

      // Create appointment date
      const appointmentDateTime = new Date(`${bookingData.appointmentDate}T${bookingData.appointmentTime}`);
      
      const downPaymentAmount = service.requiresDownPayment ? parseFloat(service.downPaymentAmount || "0") : 0;
      const totalAmount = parseFloat(service.price);
      const remainingAmount = totalAmount - downPaymentAmount;

      const appointment = await storage.createAppointment({
        clientId: client.id,
        serviceId: service.id,
        staffId: bookingData.staffId,
        appointmentDate: appointmentDateTime,
        status: service.requiresDownPayment ? "pending" : "confirmed",
        totalAmount: service.price,
        downPaymentAmount: service.downPaymentAmount,
        downPaymentPaid: !service.requiresDownPayment,
        remainingAmount: remainingAmount.toString(),
      });

      res.json(appointment);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating appointment: " + error.message });
    }
  });

  // Create payment intent for down payment
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { appointmentId } = req.body;
      
      const appointment = await storage.getAppointmentById(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      const amount = parseFloat(appointment.downPaymentAmount || "0");
      if (amount <= 0) {
        return res.status(400).json({ message: "No down payment required for this service" });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          appointmentId: appointmentId.toString(),
        },
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Confirm payment
  app.post("/api/confirm-payment", async (req, res) => {
    try {
      const { appointmentId, paymentIntentId } = req.body;
      
      await storage.updateAppointmentPayment(appointmentId, paymentIntentId, true);
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: "Error confirming payment: " + error.message });
    }
  });

  // Update appointment status
  app.patch("/api/appointments/:id/status", async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      const { status } = req.body;
      
      await storage.updateAppointmentStatus(appointmentId, status);
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: "Error updating appointment status: " + error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
