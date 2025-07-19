import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from '@/components/header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import type { AppointmentWithDetails } from '@shared/schema';

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ appointmentId }: { appointmentId: number }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const confirmPaymentMutation = useMutation({
    mutationFn: async (paymentIntentId: string) => {
      const response = await apiRequest("POST", "/api/confirm-payment", {
        appointmentId,
        paymentIntentId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Payment Successful",
        description: "Your appointment has been confirmed!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Payment Confirmation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    if (!stripe || !elements) {
      setIsProcessing(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
      redirect: "if_required",
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      await confirmPaymentMutation.mutateAsync(paymentIntent.id);
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-gradient-to-r from-rose-primary to-rose-light hover:shadow-lg"
      >
        <Lock className="mr-2 h-4 w-4" />
        {isProcessing ? "Processing..." : "Secure Payment"}
      </Button>
    </form>
  );
};

export default function Checkout() {
  const params = useParams();
  const appointmentId = parseInt(params.appointmentId || "0");
  const [clientSecret, setClientSecret] = useState("");

  const { data: appointment } = useQuery<AppointmentWithDetails>({
    queryKey: ["/api/appointments", appointmentId],
    enabled: !!appointmentId,
  });

  useEffect(() => {
    if (appointmentId) {
      apiRequest("POST", "/api/create-payment-intent", { appointmentId })
        .then((res) => res.json())
        .then((data) => {
          setClientSecret(data.clientSecret);
        });
    }
  }, [appointmentId]);

  if (!clientSecret || !appointment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-charcoal mb-6">Complete Your Payment</h2>
            
            {/* Appointment Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-charcoal mb-2">Appointment Summary</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Service:</span>
                  <span>{appointment.service.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Stylist:</span>
                  <span>{appointment.staff.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date & Time:</span>
                  <span>
                    {new Date(appointment.appointmentDate).toLocaleDateString()} at{" "}
                    {new Date(appointment.appointmentDate).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t">
                  <span>Down Payment:</span>
                  <span className="text-rose-primary">${appointment.downPaymentAmount}</span>
                </div>
              </div>
            </div>

            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm appointmentId={appointmentId} />
            </Elements>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
