import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { bookingFormSchema, type BookingForm, type Service, type Staff } from "@shared/schema";
import ServiceCard from "./service-card";
import StaffCard from "./staff-card";
import BookingSummary from "./booking-summary";
import { Scissors, Users } from "lucide-react";

export default function BookingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const form = useForm<BookingForm>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
  });

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const { data: staff = [] } = useQuery<Staff[]>({
    queryKey: ["/api/staff"],
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: BookingForm) => {
      const response = await apiRequest("POST", "/api/appointments", data);
      return response.json();
    },
    onSuccess: (appointment) => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      
      if (selectedService?.requiresDownPayment) {
        setLocation(`/checkout/${appointment.id}`);
      } else {
        toast({
          title: "Appointment Booked!",
          description: "Your appointment has been successfully scheduled.",
        });
        resetForm();
      }
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create appointment",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setCurrentStep(1);
    setSelectedService(null);
    setSelectedStaff(null);
    setSelectedDate("");
    setSelectedTime("");
    form.reset();
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !selectedService) {
      toast({
        title: "Select a Service",
        description: "Please select a service to continue",
        variant: "destructive",
      });
      return;
    }
    if (currentStep === 2 && (!selectedStaff || !selectedDate || !selectedTime)) {
      toast({
        title: "Complete Selection",
        description: "Please select a staff member, date, and time",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const onSubmit = (data: BookingForm) => {
    if (!selectedService || !selectedStaff) return;

    createAppointmentMutation.mutate({
      ...data,
      serviceId: selectedService.id,
      staffId: selectedStaff.id,
      appointmentDate: selectedDate,
      appointmentTime: selectedTime,
    });
  };

  const hairServices = services.filter(s => s.category === "hair");
  const nailServices = services.filter(s => s.category === "nails");

  // Generate time slots
  const timeSlots = [
    "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        {/* Progress Indicator */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-charcoal">Book Your Appointment</h2>
              <div className="flex space-x-2">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step <= currentStep
                        ? "bg-rose-primary text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-gradient-to-r from-rose-primary to-rose-light rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>Service</span>
              <span>Staff & Time</span>
              <span>Details</span>
            </div>
          </CardContent>
        </Card>

        {/* Step 1: Service Selection */}
        {currentStep === 1 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-charcoal mb-6">Choose Your Service</h3>
              
              {/* Hair Services */}
              <div className="mb-8">
                <h4 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                  <Scissors className="text-rose-primary mr-2 h-5 w-5" />
                  Hair Services
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {hairServices.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      selected={selectedService?.id === service.id}
                      onClick={() => setSelectedService(service)}
                    />
                  ))}
                </div>
              </div>

              {/* Nail Services */}
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                  <Users className="text-rose-primary mr-2 h-5 w-5" />
                  Nail Services
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {nailServices.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      selected={selectedService?.id === service.id}
                      onClick={() => setSelectedService(service)}
                    />
                  ))}
                </div>
              </div>

              <Button
                onClick={handleNextStep}
                className="w-full bg-gradient-to-r from-rose-primary to-rose-light hover:shadow-lg"
              >
                Continue to Staff Selection
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Staff & Time Selection */}
        {currentStep === 2 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-charcoal mb-6">Choose Your Stylist & Time</h3>
              
              {/* Staff Selection */}
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-800 mb-4">Select Your Stylist</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {staff.map((member) => (
                    <StaffCard
                      key={member.id}
                      staff={member}
                      selected={selectedStaff?.id === member.id}
                      onClick={() => setSelectedStaff(member)}
                    />
                  ))}
                </div>
              </div>

              {/* Date & Time Selection */}
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-800 mb-4">Select Date & Time</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                    <div className="grid grid-cols-2 gap-2">
                      {timeSlots.map((time) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedTime(time)}
                          className={selectedTime === time ? "bg-rose-primary hover:bg-rose-primary" : ""}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button variant="outline" onClick={handlePreviousStep} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleNextStep}
                  className="flex-1 bg-gradient-to-r from-rose-primary to-rose-light hover:shadow-lg"
                >
                  Continue to Details
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Client Information */}
        {currentStep === 3 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-charcoal mb-6">Your Information</h3>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your first name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your last name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="(555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="your.email@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <Button type="button" variant="outline" onClick={handlePreviousStep} className="flex-1">
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={createAppointmentMutation.isPending}
                      className="flex-1 bg-gradient-to-r from-rose-primary to-rose-light hover:shadow-lg"
                    >
                      {createAppointmentMutation.isPending ? "Booking..." : "Book Appointment"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Booking Summary Sidebar */}
      <div className="lg:col-span-1">
        <BookingSummary
          selectedService={selectedService}
          selectedStaff={selectedStaff}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
        />
      </div>
    </div>
  );
}
