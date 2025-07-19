import { Card } from "@/components/ui/card";
import type { Service } from "@shared/schema";

interface ServiceCardProps {
  service: Service;
  selected: boolean;
  onClick: () => void;
}

export default function ServiceCard({ service, selected, onClick }: ServiceCardProps) {
  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        selected ? "border-rose-primary bg-rose-light bg-opacity-10" : "hover:border-rose-primary"
      }`}
      onClick={onClick}
    >
      <div className="p-4">
        <img 
          src={service.imageUrl || ""}
          alt={service.name}
          className="w-full h-32 object-cover rounded-lg mb-3"
        />
        <h5 className="font-semibold text-charcoal mb-2">{service.name}</h5>
        <p className="text-gray-600 text-sm mb-3">{service.description}</p>
        <div className="flex justify-between items-center mb-2">
          <span className="text-rose-primary font-bold">${service.price}</span>
          <span className="text-gray-500 text-sm">{Math.floor(service.duration / 60)}h {service.duration % 60}m</span>
        </div>
        {service.requiresDownPayment && (
          <p className="text-xs text-gray-500">
            Down payment required: ${service.downPaymentAmount}
          </p>
        )}
      </div>
    </Card>
  );
}
