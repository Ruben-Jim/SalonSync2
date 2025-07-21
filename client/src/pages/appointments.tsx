import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import AppointmentCard from "@/components/appointment-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { Link } from "wouter";
import type { AppointmentWithDetails } from "@shared/schema";

export default function Appointments() {
  const { data: appointments = [], isLoading } = useQuery<AppointmentWithDetails[]>({
    queryKey: ["/api/appointments"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-charcoal">Appointment Management</h2>
              <div className="flex space-x-3">
                <Select>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter appointments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Appointments</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
                <Link href="/">
                  <Button className="bg-gradient-to-r from-pink-500 to-pink-400 hover:shadow-lg text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    New Appointment
                  </Button>
                </Link>
              </div>
            </div>

            {appointments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No appointments found</p>
                <Link href="/">
                  <Button className="bg-gradient-to-r from-pink-500 to-pink-400 text-white">
                    Book Your First Appointment
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
