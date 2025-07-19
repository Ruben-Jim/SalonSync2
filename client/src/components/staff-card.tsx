import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import type { Staff } from "@shared/schema";

interface StaffCardProps {
  staff: Staff;
  selected: boolean;
  onClick: () => void;
}

export default function StaffCard({ staff, selected, onClick }: StaffCardProps) {
  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 ${
        selected ? "border-rose-primary bg-rose-light bg-opacity-10" : "hover:border-rose-primary"
      }`}
      onClick={onClick}
    >
      <div className="p-4 text-center">
        <img 
          src={staff.imageUrl || ""}
          alt={staff.name}
          className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"
        />
        <h5 className="font-semibold text-charcoal">{staff.name}</h5>
        <p className="text-gray-600 text-sm mb-1">{staff.title}</p>
        <p className="text-xs text-gray-500 mb-2">{staff.experience}</p>
        <div className="flex justify-center">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-current" />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
