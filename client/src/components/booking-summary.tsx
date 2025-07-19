import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";
import type { Service, Staff } from "@shared/schema";

interface BookingSummaryProps {
  selectedService: Service | null;
  selectedStaff: Staff | null;
  selectedDate: string;
  selectedTime: string;
}

export default function BookingSummary({ 
  selectedService, 
  selectedStaff, 
  selectedDate, 
  selectedTime 
}: BookingSummaryProps) {
  if (!selectedService) {
    return (
      <Card className="sticky top-4">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-charcoal mb-4">Booking Summary</h3>
          <p className="text-gray-500">Select a service to see booking details</p>
        </CardContent>
      </Card>
    );
  }

  const totalAmount = parseFloat(selectedService.price);
  const downPayment = selectedService.requiresDownPayment ? parseFloat(selectedService.downPaymentAmount || "0") : 0;
  const remaining = totalAmount - downPayment;

  return (
    <Card className="sticky top-4">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-charcoal mb-4">Booking Summary</h3>
        
        {/* Selected Service */}
        <div className="mb-4 pb-4 border-b border-gray-100">
          <div className="flex justify-between items-start mb-2">
            <span className="font-medium text-charcoal">{selectedService.name}</span>
            <span className="text-rose-primary font-bold">${selectedService.price}</span>
          </div>
          <p className="text-sm text-gray-600">
            {Math.floor(selectedService.duration / 60)}h {selectedService.duration % 60}m
          </p>
        </div>

        {/* Selected Staff */}
        {selectedStaff && (
          <div className="mb-4 pb-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <img 
                src={selectedStaff.imageUrl || ""}
                alt={selectedStaff.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-medium text-charcoal">{selectedStaff.name}</p>
                <p className="text-sm text-gray-600">{selectedStaff.title}</p>
              </div>
            </div>
          </div>
        )}

        {/* Appointment Details */}
        {selectedDate && selectedTime && (
          <div className="mb-4 pb-4 border-b border-gray-100">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{selectedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{selectedTime}</span>
              </div>
            </div>
          </div>
        )}

        {/* Payment Breakdown */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between">
            <span className="text-gray-600">Service Total:</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
          {selectedService.requiresDownPayment && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-600">Down Payment:</span>
                <span className="text-rose-primary font-medium">${downPayment.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Remaining (pay in person):</span>
                <span>${remaining.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>

        {/* Security Notice */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-start space-x-2">
            <Shield className="text-green-500 h-4 w-4 mt-1" />
            <div>
              <p className="text-sm font-medium text-gray-800">Secure Payment</p>
              <p className="text-xs text-gray-600">
                Your payment information is protected with bank-level security.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
