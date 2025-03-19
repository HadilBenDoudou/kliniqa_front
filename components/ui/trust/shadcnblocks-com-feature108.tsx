import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { Layout, Pointer, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TabContent {
  badge: string;
  title: string;
  description: string;
  buttonText: string;
  imageSrc: string;
  imageAlt: string;
}

interface Tab {
  value: string;
  icon: React.ReactNode;
  label: string;
  content: TabContent;
}

interface Feature108Props {
  badge?: string;
  heading?: string;
  description?: string;
  tabs?: Tab[];
}

const Feature108 = ({
  heading = "Solutions numériques pour la santé et le médical avec Shadcn & Tailwind",
  description = "Transformez les soins de santé avec des outils numériques innovants et accessibles.",
  tabs = [
    {
      value: "tab-1",
      icon: <Zap className="h-auto w-4 shrink-0" />,
      label: "Efficacité des soins",
      content: {
        badge: "Technologie de pointe",
        title: "Optimisez les soins aux patients.",
        description:
          "Adoptez des solutions numériques modernes pour améliorer la gestion des soins, réduire les temps d'attente et offrir des diagnostics plus précis grâce à une technologie adaptée aux besoins de la santé.",
        buttonText: "Découvrir les solutions",
        imageSrc: "/trust/Group 8 (1).png",
        imageAlt: "Solution pour les soins de santé",
      },
    },
    {
      value: "tab-2",
      icon: <Pointer className="h-auto w-4 shrink-0" />,
      label: "Interaction patient",
      content: {
        badge: "Expérience santé",
        title: "Connectez-vous mieux avec vos patients.",
        description:
          "Proposez une interface intuitive pour faciliter la prise de rendez-vous, le suivi des traitements et la communication avec les professionnels de santé, renforçant ainsi la confiance et le bien-être des patients.",
        buttonText: "Voir les outils",
        imageSrc: "/trust/Group 8 (1).png",
        imageAlt: "Interaction avec les patients",
      },
    },
    {
      value: "tab-3",
      icon: <Layout className="h-auto w-4 shrink-0" />,
      label: "Gestion de santé",
      content: {
        badge: "Systèmes avancés",
        title: "Simplifiez la gestion de la santé.",
        description:
          "Créez des plateformes performantes pour gérer les dossiers médicaux électroniques, coordonner les équipes soignantes et optimiser les opérations des pharmacies ou cliniques avec une approche centrée sur la santé.",
        buttonText: "Explorer les options",
        imageSrc: "/trust/Group 8 (1).png",
        imageAlt: "Gestion des systèmes de santé",
      },
    },
  ],
}: Feature108Props) => {
  return (
    <section className="py-32">
      <div className="container mx-auto">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="max-w-2xl text-3xl font-semibold md:text-4xl">
            {heading}
          </h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <Tabs defaultValue={tabs[0].value} className="mt-8">
          <TabsList className="container flex flex-col items-center justify-center gap-4 sm:flex-row md:gap-10">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground data-[state=active]:bg-muted data-[state=active]:text-primary"
              >
                {tab.icon} {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="mx-auto mt-8 max-w-screen-xl rounded-2xl bg-muted/70 p-6 lg:p-16">
            {tabs.map((tab) => (
              <TabsContent
                key={tab.value}
                value={tab.value}
                className="grid place-items-center gap-20 lg:grid-cols-2 lg:gap-10"
              >
                <div className="flex flex-col gap-5">
                  <Badge variant="outline" className="w-fit bg-background">
                    {tab.content.badge}
                  </Badge>
                  <h3 className="text-3xl font-semibold lg:text-5xl">
                    {tab.content.title}
                  </h3>
                  <p className="text-muted-foreground lg:text-lg">
                    {tab.content.description}
                  </p>
                  <Button className="mt-2.5 w-fit gap-2" size="lg">
                    {tab.content.buttonText}
                  </Button>
                </div>
                <img
                  src={tab.content.imageSrc}
                  alt={tab.content.imageAlt}
                  className="rounded-xl"
                />
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </section>
  );
};

export { Feature108 };