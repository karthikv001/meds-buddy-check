
import { useState } from "react";
import Onboarding from "@/components/Onboarding";
import PatientDashboard from "@/components/PatientDashboard";
import CaretakerDashboard from "@/components/CaretakerDashboard";
import { Button } from "@/components/ui/button";
import { Users, User } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";


type UserType = "patient" | "caretaker" | null;

const Index = () => {
  const [userType, setUserType] = useState<UserType>(null);
  const [isOnboarded, setIsOnboarded] = useState(false);

  const handleOnboardingComplete = (type: UserType) => {
    setUserType(type);
    setIsOnboarded(true);
  };

  const switchUserType = () => {
    const newType = userType === "patient" ? "caretaker" : "patient";
    setUserType(newType);
  };

  console.log(supabase);
  

  if (!isOnboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-border/20 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">MediCare Companion</h1>
              <p className="text-sm text-muted-foreground">
                {userType === "patient" ? "Patient View" : "Caretaker View"}
              </p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            onClick={switchUserType}
            className="flex items-center gap-2 hover:bg-accent transition-colors"
          >
            {userType === "patient" ? <Users className="w-4 h-4" /> : <User className="w-4 h-4" />}
            Switch to {userType === "patient" ? "Caretaker" : "Patient"}
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        
        {userType === "patient" ? <PatientDashboard /> : <CaretakerDashboard />}
      </main>

      
    </div>
  );
};

export default Index;
