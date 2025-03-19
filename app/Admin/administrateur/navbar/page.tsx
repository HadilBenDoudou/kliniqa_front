import {  Home, HelpCircle, Settings, Shield, Mail, User, FileText, Lock } from "lucide-react";
import { ExpandableTabs } from "@/components/ui/ExpandableTabsProps";

// Démo par défaut
function DefaultDemo() {
    const tabs = [
      { title: "Dashboard", icon: Home },
      { type: "separator" as const },
      { title: "Settings", icon: Settings },
      { title: "Support", icon: HelpCircle },
      { title: "Security", icon: Shield },
    ];
  
    return (
      <div className="flex flex-col gap-4 mb-6">
        <ExpandableTabs tabs={tabs} />
      </div>
    );
  }
  
  // Démo avec couleurs personnalisées
  function CustomColorDemo() {
    const tabs = [
      { title: "Profile", icon: User },
      { title: "Messages", icon: Mail },
      { type: "separator" as const },
      { title: "Documents", icon: FileText },
      { title: "Privacy", icon: Lock },
    ];
  
    return (
      <div className="flex flex-col gap-4 mb-6">
        <ExpandableTabs
          tabs={tabs}
          activeColor="text-blue-500"
          className="border-blue-200 dark:border-blue-800"
        />
      </div>
    );
  }
  
  export default { DefaultDemo, CustomColorDemo };