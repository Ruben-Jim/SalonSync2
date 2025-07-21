import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2 } from "lucide-react";
import type { AppointmentWithDetails } from "@shared/schema";

interface AppointmentCardProps {
  appointment: AppointmentWithDetails;
}

export default function AppointmentCard({ appointment }: AppointmentCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await apiRequest("PATCH", `/api/appointments/${appointment.id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Status Updated",
        description: "Appointment status has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update appointment status",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex space-x-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-lg font-medium text-gray-600">
                {appointment.client.firstName.charAt(0)}{appointment.client.lastName.charAt(0)}
              </span>
            </div>
            <div>
              <h4 className="font-semibold text-charcoal">
                {appointment.client.firstName} {appointment.client.lastName}
              </h4>
              <p className="text-gray-600">{appointment.service.name}</p>
              <p className="text-sm text-gray-500">
                {formatDate(appointment.appointmentDate)} at {formatTime(appointment.appointmentDate)}
              </p>
              <p className="text-sm text-gray-500">with {appointment.staff.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className={`${getStatusColor(appointment.status)} border-0`}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </Badge>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-pink-500">
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-400 hover:text-red-500"
                onClick={() => updateStatusMutation.mutate("cancelled")}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm">
          {appointment.service.requiresDownPayment ? (
            <>
              <span>
                Down payment: {" "}
                <span className={appointment.downPaymentPaid ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                  ${appointment.downPaymentAmount} {appointment.downPaymentPaid ? "paid" : "pending"}
                </span>
              </span>
              <span>
                Remaining: <span className="text-rose-primary font-medium">${appointment.remainingAmount}</span>
              </span>
            </>
          ) : (
            <span>
              Payment: <span className="text-gray-600">In person (${appointment.totalAmount})</span>
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
